const express = require('express');
const router = express.Router();
const {
  getCategorias,
  getCategoriaById,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} = require('../controllers/categoriaController');
const { protect, soloAdmin } = require('../middleware/authMiddleware');

// Leer es público (lo usa el sitio). Crear, editar y borrar: solo el administrador.
router.route('/').get(getCategorias).post(protect, soloAdmin, crearCategoria);

router
  .route('/:id')
  .get(getCategoriaById)
  .put(protect, soloAdmin, actualizarCategoria)
  .delete(protect, soloAdmin, eliminarCategoria);

module.exports = router;