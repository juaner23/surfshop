const express = require('express');
const router = express.Router();
const {
  getPublicaciones,
  getPublicacionById,
  crearPublicacion,
  actualizarPublicacion,
  eliminarPublicacion
} = require('../controllers/publicacionController');

router.route('/').get(getPublicaciones).post(crearPublicacion);

router.route('/:id').get(getPublicacionById).put(actualizarPublicacion).delete(eliminarPublicacion);

module.exports = router;
