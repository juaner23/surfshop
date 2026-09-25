const Publicacion = require('../models/Publicacion');
const Categoria = require('../models/Categoria');

const CAMPOS_ACTUALIZABLES = [
  'nombre', 'categoriaId', 'descripcion', 'tipo', 'nivel',
  'precio', 'unidadPrecio', 'imagenes', 'estado', 'destacado', 'activo'
];

const ORDENES_VALIDOS = {
  recientes: { createdAt: -1 },
  precio_asc: { precio: 1 },
  precio_desc: { precio: -1 },
};

const escaparRegex = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const armarFiltro = (query) => {
  const { categoriaId, tipo, q, destacado, precioMin, precioMax, disponible } = query;
  const filtro = {};

  if (typeof categoriaId === 'string' && categoriaId) filtro.categoriaId = categoriaId;
  if (typeof tipo === 'string' && tipo) filtro.tipo = tipo;

  if (typeof q === 'string' && q.trim()) {
    const texto = escaparRegex(q.trim().slice(0, 100));
    filtro.$or = [
      { nombre: { $regex: texto, $options: 'i' } },
      { descripcion: { $regex: texto, $options: 'i' } }
    ];
  }

  // ?destacado=true / ?destacado=false
  if (destacado === 'true') filtro.destacado = true;
  if (destacado === 'false') filtro.destacado = false;

  // ?disponible=true / ?disponible=false (mapea al campo "estado" del modelo)
  if (disponible === 'true') filtro.estado = 'disponible';
  if (disponible === 'false') filtro.estado = 'no_disponible';

  // ?precioMin=1000&precioMax=5000 (los dos son opcionales e independientes entre sí)
  const rangoPrecio = {};
  if (typeof precioMin === 'string' && precioMin.trim() !== '') {
    const min = Number(precioMin);
    if (!Number.isNaN(min) && min >= 0) rangoPrecio.$gte = min;
  }
  if (typeof precioMax === 'string' && precioMax.trim() !== '') {
    const max = Number(precioMax);
    if (!Number.isNaN(max) && max >= 0) rangoPrecio.$lte = max;
  }
  if (Object.keys(rangoPrecio).length > 0) filtro.precio = rangoPrecio;

  return filtro;
};

// ?orden=recientes (default) | precio_asc | precio_desc
// Un valor desconocido o ausente cae siempre en "recientes", nunca rompe la consulta.
const armarOrden = (query) => ORDENES_VALIDOS[query.orden] || ORDENES_VALIDOS.recientes;

const getPublicaciones = async (req, res) => {
  const filtro = { ...armarFiltro(req.query), activo: true };

  const publicaciones = await Publicacion.find(filtro)
    .populate('categoriaId', 'nombre')
    .sort(armarOrden(req.query));

  res.json(publicaciones);
};

const getPublicacionesAdmin = async (req, res) => {
  const filtro = armarFiltro(req.query);
  if (req.query.activo === 'true') filtro.activo = true;
  if (req.query.activo === 'false') filtro.activo = false;

  const publicaciones = await Publicacion.find(filtro)
    .populate('categoriaId', 'nombre')
    .sort(armarOrden(req.query));

  res.json(publicaciones);
};

const getPublicacionById = async (req, res) => {
  const publicacion = await Publicacion.findById(req.params.id).populate('categoriaId', 'nombre');

  if (!publicacion || !publicacion.activo) {
    res.status(404);
    throw new Error('Publicación no encontrada');
  }

  res.json(publicacion);
};

const crearPublicacion = async (req, res) => {
  const categoria = await Categoria.findById(req.body.categoriaId);
  if (!categoria) {
    res.status(400);
    throw new Error('La categoría indicada no existe');
  }

  const datos = {};
  CAMPOS_ACTUALIZABLES.forEach((campo) => {
    if (req.body[campo] !== undefined) datos[campo] = req.body[campo];
  });

  const publicacion = await Publicacion.create(datos);
  res.status(201).json(publicacion);
};

const actualizarPublicacion = async (req, res) => {
  const publicacion = await Publicacion.findById(req.params.id);

  if (!publicacion) {
    res.status(404);
    throw new Error('Publicación no encontrada');
  }

  CAMPOS_ACTUALIZABLES.forEach((campo) => {
    if (req.body[campo] !== undefined) publicacion[campo] = req.body[campo];
  });

  const publicacionActualizada = await publicacion.save();
  res.json(publicacionActualizada);
};

const eliminarPublicacion = async (req, res) => {
  const publicacion = await Publicacion.findById(req.params.id);

  if (!publicacion) {
    res.status(404);
    throw new Error('Publicación no encontrada');
  }

  await publicacion.deleteOne();
  res.json({ message: 'Publicación eliminada' });
};

module.exports = {
  getPublicaciones,
  getPublicacionesAdmin,
  getPublicacionById,
  crearPublicacion,
  actualizarPublicacion,
  eliminarPublicacion
};