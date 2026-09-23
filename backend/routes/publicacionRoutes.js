const express = require('express');
const router = express.Router();
const {
  getPublicaciones,
  getPublicacionesAdmin,
  getPublicacionById,
  crearPublicacion,
  actualizarPublicacion,
  eliminarPublicacion
} = require('../controllers/publicacionController');
const { protect, soloAdmin } = require('../middleware/authMiddleware');

router.route('/').get(getPublicaciones).post(protect, soloAdmin, crearPublicacion);

router.get('/admin/todas', protect, soloAdmin, getPublicacionesAdmin);

router
  .route('/:id')
  .get(getPublicacionById)
  .put(protect, soloAdmin, actualizarPublicacion)
  .delete(protect, soloAdmin, eliminarPublicacion);

module.exports = router;