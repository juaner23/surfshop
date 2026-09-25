const Promocion = require('../models/Promocion');
const Publicacion = require('../models/Publicacion');

const CAMPOS_ACTUALIZABLES = [
  'titulo', 'descripcion', 'tipo', 'descuentoPorcentaje',
  'publicacionId', 'fechaInicio', 'fechaFin', 'imagen', 'activo'
];

// Chequeo de fechas a mano, además del validador del schema.
// Hace falta acá porque findByIdAndUpdate/save con $set no siempre dispara el validador
// del schema con el "this" correcto cuando solo se manda una de las dos fechas.
const validarFechas = (fechaInicio, fechaFin) => {
  if (fechaInicio && fechaFin && new Date(fechaFin) <= new Date(fechaInicio)) {
    return 'La fecha de fin tiene que ser posterior a la fecha de inicio';
  }
  return null;
};

// @desc    Listar promociones y novedades vigentes
// @route   GET /api/promociones
// @access  Público
const getPromociones = async (req, res) => {
  const ahora = new Date();
  const filtro = {
    activo: true,
    fechaInicio: { $lte: ahora },
    fechaFin: { $gte: ahora }
  };

  if (typeof req.query.tipo === 'string' && req.query.tipo) filtro.tipo = req.query.tipo;

  const promociones = await Promocion.find(filtro)
    .populate('publicacionId', 'nombre')
    .sort({ fechaInicio: -1 });

  res.json(promociones);
};

// @desc    Ver una promoción vigente por id
// @route   GET /api/promociones/:id
// @access  Público
const getPromocionById = async (req, res) => {
  const promocion = await Promocion.findById(req.params.id).populate('publicacionId', 'nombre');

  const ahora = new Date();
  const vigente = promocion && promocion.activo &&
    promocion.fechaInicio <= ahora && promocion.fechaFin >= ahora;

  if (!vigente) {
    res.status(404);
    throw new Error('Promoción no encontrada');
  }

  res.json(promocion);
};

// @desc    Listar TODAS las promociones (vigentes, vencidas, activas o no)
// @route   GET /api/promociones/admin/todas
// @access  Privado/Admin
const getPromocionesAdmin = async (req, res) => {
  const filtro = {};
  if (typeof req.query.tipo === 'string' && req.query.tipo) filtro.tipo = req.query.tipo;
  if (req.query.activo === 'true') filtro.activo = true;
  if (req.query.activo === 'false') filtro.activo = false;

  const promociones = await Promocion.find(filtro)
    .populate('publicacionId', 'nombre')
    .sort({ fechaInicio: -1 });

  res.json(promociones);
};

// @desc    Crear una promoción o novedad
// @route   POST /api/promociones
// @access  Privado/Admin
const crearPromocion = async (req, res) => {
  if (req.body.publicacionId) {
    const publicacion = await Publicacion.findById(req.body.publicacionId);
    if (!publicacion) {
      res.status(400);
      throw new Error('La publicación indicada no existe');
    }
  }

  const errorFechas = validarFechas(req.body.fechaInicio, req.body.fechaFin);
  if (errorFechas) {
    res.status(400);
    throw new Error(errorFechas);
  }

  const datos = {};
  CAMPOS_ACTUALIZABLES.forEach((campo) => {
    if (req.body[campo] !== undefined) datos[campo] = req.body[campo];
  });

  const promocion = await Promocion.create(datos);
  res.status(201).json(promocion);
};

// @desc    Modificar una promoción o novedad
// @route   PUT /api/promociones/:id
// @access  Privado/Admin
const actualizarPromocion = async (req, res) => {
  const promocion = await Promocion.findById(req.params.id);

  if (!promocion) {
    res.status(404);
    throw new Error('Promoción no encontrada');
  }

  if (req.body.publicacionId) {
    const publicacion = await Publicacion.findById(req.body.publicacionId);
    if (!publicacion) {
      res.status(400);
      throw new Error('La publicación indicada no existe');
    }
  }

  // Para validar fechas en un update parcial, tomamos la que venga nueva o, si no vino, la que ya tenía
  const fechaInicio = req.body.fechaInicio ?? promocion.fechaInicio;
  const fechaFin = req.body.fechaFin ?? promocion.fechaFin;
  const errorFechas = validarFechas(fechaInicio, fechaFin);
  if (errorFechas) {
    res.status(400);
    throw new Error(errorFechas);
  }

  CAMPOS_ACTUALIZABLES.forEach((campo) => {
    if (req.body[campo] !== undefined) promocion[campo] = req.body[campo];
  });

  const promocionActualizada = await promocion.save();
  res.json(promocionActualizada);
};

// @desc    Eliminar una promoción o novedad
// @route   DELETE /api/promociones/:id
// @access  Privado/Admin
const eliminarPromocion = async (req, res) => {
  const promocion = await Promocion.findById(req.params.id);

  if (!promocion) {
    res.status(404);
    throw new Error('Promoción no encontrada');
  }

  await promocion.deleteOne();
  res.json({ message: 'Promoción eliminada' });
};

module.exports = {
  getPromociones,
  getPromocionById,
  getPromocionesAdmin,
  crearPromocion,
  actualizarPromocion,
  eliminarPromocion
};