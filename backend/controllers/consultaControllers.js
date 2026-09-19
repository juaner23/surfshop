const Consulta = require('../models/Consulta');

// @desc    Crear una consulta (formulario de contacto)
// @route   POST /api/consultas
// @access  Público
const crearConsulta = async (req, res) => {
  const { publicacionId, nombre, email, telefono, asunto, mensaje } = req.body;

  const consulta = await Consulta.create({
    publicacionId,
    nombre,
    email,
    telefono,
    asunto,
    mensaje,
  });

  res.status(201).json(consulta);
};

// @desc    Listar todas las consultas (admite ?estado=pendiente para filtrar)
// @route   GET /api/consultas
// @access  Privado/Admin (todavía sin proteger, lo sumamos en el paso 4)
const getConsultas = async (req, res) => {
  const filtro = {};
  if (req.query.estado) filtro.estado = req.query.estado;

  const consultas = await Consulta.find(filtro).sort({ createdAt: -1 });
  res.json(consultas);
};

// @desc    Obtener una consulta por id
// @route   GET /api/consultas/:id
// @access  Privado/Admin
const getConsultaById = async (req, res) => {
  const consulta = await Consulta.findById(req.params.id);

  if (!consulta) {
    res.status(404);
    throw new Error('Consulta no encontrada');
  }

  res.json(consulta);
};

// @desc    Cambiar el estado de una consulta (pendiente/leida/respondida)
// @route   PATCH /api/consultas/:id/estado
// @access  Privado/Admin
const actualizarEstadoConsulta = async (req, res) => {
  const { estado } = req.body;
  const estadosValidos = ['pendiente', 'leida', 'respondida'];

  if (!estadosValidos.includes(estado)) {
    res.status(400);
    throw new Error(`El estado debe ser uno de: ${estadosValidos.join(', ')}`);
  }

  const consulta = await Consulta.findById(req.params.id);

  if (!consulta) {
    res.status(404);
    throw new Error('Consulta no encontrada');
  }

  consulta.estado = estado;
  const consultaActualizada = await consulta.save();
  res.json(consultaActualizada);
};

// @desc    Eliminar una consulta
// @route   DELETE /api/consultas/:id
// @access  Privado/Admin
const eliminarConsulta = async (req, res) => {
  const consulta = await Consulta.findById(req.params.id);

  if (!consulta) {
    res.status(404);
    throw new Error('Consulta no encontrada');
  }

  await consulta.deleteOne();
  res.json({ message: 'Consulta eliminada' });
};

module.exports = {
  crearConsulta,
  getConsultas,
  getConsultaById,
  actualizarEstadoConsulta,
  eliminarConsulta,
};