const express = require('express');
const router = express.Router();
const {
  getCategorias,
  getCategoriaById,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
} = require('../controllers/categoriaController');

// router.route(path) permite encadenar los distintos métodos HTTP para la misma URL.
router.route('/').get(getCategorias).post(crearCategoria);

router.route('/:id').get(getCategoriaById).put(actualizarCategoria).delete(eliminarCategoria);

module.exports = router;
