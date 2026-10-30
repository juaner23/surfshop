const express = require('express');
const router = express.Router();
const {
  getCategorias,
  getCategoriasAdmin,
  getCategoriaById,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} = require('../controllers/categoriaController');
const { protect, soloAdmin } = require('../middleware/authMiddleware');

// Leer es público (lo usa el sitio). Crear, editar y borrar: solo el administrador.
router.route('/').get(getCategorias).post(protect, soloAdmin, crearCategoria);

// Tiene que ir ANTES de "/:id", si no Express interpreta "admin" como si fuera un id
router.get('/admin/todas', protect, soloAdmin, getCategoriasAdmin);

router
  .route('/:id')
  .get(getCategoriaById)
  .put(protect, soloAdmin, actualizarCategoria)
  .delete(protect, soloAdmin, eliminarCategoria);

module.exports = router;
