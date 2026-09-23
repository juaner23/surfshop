const Categoria = require('../models/Categoria');
const Publicacion = require('../models/Publicacion');

// @desc    Listar todas las categorías
// @route   GET /api/categorias
// @access  Público
const getCategorias = async (req, res) => {
  const categorias = await Categoria.find({ activo: true }).sort({ nombre: 1 });
  res.json(categorias);
};

// @desc    Obtener una categoría por id
// @route   GET /api/categorias/:id
// @access  Público
const getCategoriaById = async (req, res) => {
  const categoria = await Categoria.findById(req.params.id);

  if (!categoria || !categoria.activo) {
    res.status(404);
    throw new Error('Categoría no encontrada');
  }

  res.json(categoria);
};

// @desc    Crear una categoría
// @route   POST /api/categorias
// @access  Privado/Admin (todavía sin proteger, lo sumamos en el paso 4)
const crearCategoria = async (req, res) => {
  const { nombre, descripcion, tipo, activo } = req.body;

  const categoria = await Categoria.create({ nombre, descripcion, tipo, activo });
  res.status(201).json(categoria);
};

// @desc    Modificar una categoría
// @route   PUT /api/categorias/:id
// @access  Privado/Admin
const actualizarCategoria = async (req, res) => {
  const categoria = await Categoria.findById(req.params.id);

  if (!categoria) {
    res.status(404);
    throw new Error('Categoría no encontrada');
  }

  categoria.nombre = req.body.nombre ?? categoria.nombre;
  categoria.descripcion = req.body.descripcion ?? categoria.descripcion;
  categoria.tipo = req.body.tipo ?? categoria.tipo;
  categoria.activo = req.body.activo ?? categoria.activo;

  const categoriaActualizada = await categoria.save();
  res.json(categoriaActualizada);
};

// @desc    Eliminar una categoría
// @route   DELETE /api/categorias/:id
// @access  Privado/Admin
const eliminarCategoria = async (req, res) => {
  const categoria = await Categoria.findById(req.params.id);

  if (!categoria) {
    res.status(404);
    throw new Error('Categoría no encontrada');
  }

  // Regla de integridad: si hay publicaciones usando esta categoría, no la dejamos borrar
  // (si no, esas publicaciones quedarían con una referencia "colgada" a una categoría inexistente).
  const productosAsociados = await Publicacion.countDocuments({ categoriaId: categoria._id });
  if (productosAsociados > 0) {
    res.status(400);
    throw new Error(
      `No se puede eliminar: hay ${productosAsociados} producto(s) que usan esta categoría`
    );
  }

  await categoria.deleteOne();
  res.json({ message: 'Categoría eliminada' });
};

module.exports = {
  getCategorias,
  getCategoriaById,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
};