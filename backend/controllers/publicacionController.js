const Publicacion = require('../models/Publicacion');
const Categoria = require('../models/Categoria');

const CAMPOS_ACTUALIZABLES = [
  'nombre', 'categoriaId', 'descripcion', 'tipo', 'nivel',
  'precio', 'unidadPrecio', 'imagenes', 'estado', 'destacado', 'activo'
];

const escaparRegex = (texto) => texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const armarFiltro = (query) => {
  const { categoriaId, tipo, q } = query;
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

  return filtro;
};

const getPublicaciones = async (req, res) => {
  const filtro = { ...armarFiltro(req.query), activo: true };

  const publicaciones = await Publicacion.find(filtro)
    .populate('categoriaId', 'nombre')
    .sort({ createdAt: -1 });

  res.json(publicaciones);
};

const getPublicacionesAdmin = async (req, res) => {
  const filtro = armarFiltro(req.query);
  if (req.query.activo === 'true') filtro.activo = true;
  if (req.query.activo === 'false') filtro.activo = false;

  const publicaciones = await Publicacion.find(filtro)
    .populate('categoriaId', 'nombre')
    .sort({ createdAt: -1 });

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