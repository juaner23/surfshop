const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const TokenInvalidado = require('../models/TokenInvalidado');

// Guardia de rutas: solo deja pasar a quien manda un token válido.
// El token viaja en el header:  Authorization: Bearer <token>
const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('No autorizado: falta el token');
  }
  const token = header.split(' ')[1];

  // 1. La firma es auténtica y no venció
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    res.status(401);
    throw new Error('No autorizado: el token es inválido o venció');
  }

  // 2. No fue invalidado por un logout
  const invalidado = await TokenInvalidado.findOne({ token });
  if (invalidado) {
    res.status(401);
    throw new Error('No autorizado: la sesión fue cerrada');
  }

  // 3. El usuario todavía existe
  const usuario = await Usuario.findById(decoded.id);
  if (!usuario) {
    res.status(401);
    throw new Error('No autorizado: el usuario ya no existe');
  }

  // Dejamos los datos a mano para los controllers que vienen después
  req.usuario = usuario;
  req.token = token;
  req.tokenExp = decoded.exp;
  next();
};

// Deja pasar solo a quien tiene rol de administrador.
// Va SIEMPRE después de protect (protect es quien carga req.usuario).
const soloAdmin = (req, res, next) => {
  if (!req.usuario || req.usuario.rol !== 'administrador') {
    res.status(403);
    throw new Error('Acceso denegado: se requiere rol de administrador');
  }
  next();
};

module.exports = { protect, soloAdmin };