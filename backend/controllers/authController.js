const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const TokenInvalidado = require('../models/TokenInvalidado');
const { enviarMailRestablecer } = require('../utils/recuperacion');
const Usuario = require('../models/Usuario');
const { validarPassword } = require('../utils/validarPassword');

const REGEX_EMAIL = /^\S+@\S+\.\S+$/;
const REGEX_TELEFONO = /^\+?[\d\s()-]{8,20}$/;

// @desc    Registrar un administrador
// @route   POST /api/auth/registro
// @access  Público, pero exige el código de administrador (CODIGO_ADMIN del .env)
const registro = async (req, res) => {
  const { nombre, apellido, email, telefono, password, codigoAdmin } = req.body;

  // 1. Todos los campos tienen que llegar y ser texto
  // (chequear que sea texto evita que manden objetos raros en lugar del email)
  const campos = { nombre, apellido, email, telefono, password, codigoAdmin };
  for (const [clave, valor] of Object.entries(campos)) {
    if (typeof valor !== 'string' || valor.trim() === '') {
      res.status(400);
      throw new Error(`El campo ${clave} es obligatorio`);
    }
  }

  // 2. Código de administrador
  if (!process.env.CODIGO_ADMIN) {
    res.status(500);
    throw new Error('Falta configurar CODIGO_ADMIN en el servidor');
  }
  if (codigoAdmin !== process.env.CODIGO_ADMIN) {
    res.status(403);
    throw new Error('Código de administrador incorrecto');
  }

  // 3. Formato de email y teléfono
  if (!REGEX_EMAIL.test(email.trim())) {
    res.status(400);
    throw new Error('El email no tiene un formato válido');
  }
  if (!REGEX_TELEFONO.test(telefono.trim())) {
    res.status(400);
    throw new Error('El teléfono no es válido (entre 8 y 20 caracteres: números, +, espacios, guiones o paréntesis)');
  }

  // 4. Política de contraseña
  const erroresPassword = validarPassword(password);
  if (erroresPassword.length > 0) {
    res.status(400);
    throw new Error(`La contraseña ${erroresPassword.join(', ')}`);
  }

  // 5. Email no duplicado
  const existe = await Usuario.findOne({ email: email.trim().toLowerCase() });
  if (existe) {
    res.status(409);
    throw new Error('Ya existe un usuario registrado con ese email');
  }

  // 6. Hashear y guardar (el número 10 es el "costo" del hash)
  const passwordHash = await bcrypt.hash(password, 10);
  const usuario = await Usuario.create({ nombre, apellido, email, telefono, passwordHash });

  // Armamos la respuesta a mano para NO devolver el hash
  res.status(201).json({
    _id: usuario._id,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    email: usuario.email,
    telefono: usuario.telefono,
    rol: usuario.rol,
  });
};

// @desc    Iniciar sesión
// @route   POST /api/auth/login
// @access  Público
const login = async (req, res) => {
  const { email, password } = req.body;

  // 1. Llegan los dos datos y son texto
  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    res.status(400);
    throw new Error('Email y contraseña son obligatorios');
  }

  // 2. Buscar al usuario (el hash hay que pedirlo a propósito, porque el modelo lo oculta)
  const usuario = await Usuario.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');

  // 3. Mismo mensaje si el email no existe o la contraseña está mal,
  // así nadie puede averiguar qué emails están registrados
  const passwordOk = usuario ? await bcrypt.compare(password, usuario.passwordHash) : false;
  if (!usuario || !passwordOk) {
    res.status(401);
    throw new Error('Credenciales inválidas');
  }

  // 4. Generar el token (vale 8 horas)
  const token = jwt.sign(
    { id: usuario._id, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    token,
    usuario: {
      _id: usuario._id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      telefono: usuario.telefono,
      rol: usuario.rol,
    },
  });
};

// @desc    Ver los datos del administrador logueado
// @route   GET /api/auth/me
// @access  Privado (requiere token)
const perfil = async (req, res) => {
  const u = req.usuario;
  res.json({
    _id: u._id,
    nombre: u.nombre,
    apellido: u.apellido,
    email: u.email,
    telefono: u.telefono,
    rol: u.rol,
  });
};

// @desc    Cerrar sesión (el token queda invalidado)
// @route   POST /api/auth/logout
// @access  Privado (requiere token)
const logout = async (req, res) => {
  await TokenInvalidado.create({
    usuarioId: req.usuario._id,
    token: req.token,
    expiraEn: new Date(req.tokenExp * 1000), // el mismo momento en que el token iba a vencer solo
  });
  res.json({ mensaje: 'Sesión cerrada correctamente' });
};


// @desc    Modificar los datos personales del administrador logueado
// @route   PUT /api/auth/me
// @access  Privado (requiere token)
const actualizarPerfil = async (req, res) => {
  // Solo estos campos se pueden modificar (así nadie se cambia el rol ni el hash)
  const permitidos = ['nombre', 'apellido', 'email', 'telefono'];
  const cambios = {};

  for (const campo of permitidos) {
    if (req.body[campo] === undefined) continue; // no lo mandó: no se toca
    const valor = req.body[campo];
    if (typeof valor !== 'string' || valor.trim() === '') {
      res.status(400);
      throw new Error(`El campo ${campo} no puede estar vacío`);
    }
    cambios[campo] = valor.trim();
  }

  if (Object.keys(cambios).length === 0) {
    res.status(400);
    throw new Error('No se envió ningún dato para modificar');
  }

  if (cambios.email !== undefined) {
    cambios.email = cambios.email.toLowerCase();
    if (!REGEX_EMAIL.test(cambios.email)) {
      res.status(400);
      throw new Error('El email no tiene un formato válido');
    }
    // El email no puede pertenecer a OTRO usuario (el propio no cuenta)
    const otro = await Usuario.findOne({ email: cambios.email, _id: { $ne: req.usuario._id } });
    if (otro) {
      res.status(409);
      throw new Error('Ya existe otro usuario registrado con ese email');
    }
  }

  if (cambios.telefono !== undefined && !REGEX_TELEFONO.test(cambios.telefono)) {
    res.status(400);
    throw new Error('El teléfono no es válido (entre 8 y 20 caracteres: números, +, espacios, guiones o paréntesis)');
  }

  const usuario = await Usuario.findByIdAndUpdate(req.usuario._id, cambios, {
    new: true,
    runValidators: true,
  });

  res.json({
    _id: usuario._id,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    email: usuario.email,
    telefono: usuario.telefono,
    rol: usuario.rol,
  });
};

// @desc    Pedir el mail para restablecer la contraseña
// @route   POST /api/auth/forgot-password
// @access  Público
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (typeof email !== 'string' || !REGEX_EMAIL.test(email.trim())) {
    res.status(400);
    throw new Error('Ingresá un email válido');
  }

  const usuario = await Usuario.findOne({ email: email.trim().toLowerCase() });

  if (usuario) {
    try {
      await enviarMailRestablecer(usuario, 'solicitud');
    } catch (error) {
      // Si el mail falla lo vemos acá, pero la respuesta al cliente no cambia
      console.error('No se pudo enviar el mail de recuperación:', error.message);
    }
  }

  // Misma respuesta exista o no el email, para no revelar qué emails están registrados
  res.json({
    mensaje: 'Si el email está registrado, te enviamos un mail con las instrucciones para restablecer la contraseña',
  });
};


module.exports = { registro, login, perfil, logout, actualizarPerfil, forgotPassword };