const Publicacion = require('../models/Publicacion');
const Categoria = require('../models/Categoria');

// Campos que se pueden modificar desde el panel de admin.
// Los definimos a mano (en vez de copiar req.body entero) para no aceptar
// cualquier cosa que venga en el pedido y solo tocar lo que corresponde.
const CAMPOS_ACTUALIZABLES = [
  'nombre', 'categoriaId', 'descripcion', 'tipo', 'nivel',
  'precio', 'unidadPrecio', 'imagenes', 'estado', 'destacado', 'activo'
];

// @desc    Listar publicaciones activas, con búsqueda y filtro opcionales
// @route   GET /api/publicaciones?categoriaId=&q=&tipo=
// @access  Público
const getPublicaciones = async (req, res) => {
  const { categoriaId, q, tipo } = req.query;

  const filtro = { activo: true }; // el sitio público solo muestra lo que el admin dejó activo
  if (categoriaId) filtro.categoriaId = categoriaId;
  if (tipo) filtro.tipo = tipo;
  if (q) {
    filtro.$or = [
      { nombre: { $regex: q, $options: 'i' } },
      { descripcion: { $regex: q, $options: 'i' } }
    ];
  }

  const publicaciones = await Publicacion.find(filtro)
    .populate('categoriaId', 'nombre')
    .sort({ createdAt: -1 });

  res.json(publicaciones);
};

// @desc    Obtener una publicación por id
// @route   GET /api/publicaciones/:id
// @access  Público
const getPublicacionById = async (req, res) => {
  const publicacion = await Publicacion.findById(req.params.id).populate('categoriaId', 'nombre');

  if (!publicacion) {
    res.status(404);
    throw new Error('Publicación no encontrada');
  }

  res.json(publicacion);
};

// @desc    Crear una publicación
// @route   POST /api/publicaciones
// @access  Privado/Admin (todavía sin proteger)
const crearPublicacion = async (req, res) => {
  const categoria = await Categoria.findById(req.body.categoriaId);
  if (!categoria) {
    res.status(400);
    throw new Error('La categoría indicada no existe');
  }

  const publicacion = await Publicacion.create(req.body);
  res.status(201).json(publicacion);
};

// @desc    Modificar una publicación (incluye activar/desactivar y cambiar estado)
// @route   PUT /api/publicaciones/:id
// @access  Privado/Admin
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

// @desc    Eliminar una publicación
// @route   DELETE /api/publicaciones/:id
// @access  Privado/Admin
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
  getPublicacionById,
  crearPublicacion,
  actualizarPublicacion,
  eliminarPublicacion
};
