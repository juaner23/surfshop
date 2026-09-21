const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

module.exports = { registro , login};