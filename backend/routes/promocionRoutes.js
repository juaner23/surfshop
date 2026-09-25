const express = require('express');
const router = express.Router();
const {
  getPromociones,
  getPromocionesAdmin,
  getPromocionById,
  crearPromocion,
  actualizarPromocion,
  eliminarPromocion
} = require('../controllers/promocionController');
const { protect, soloAdmin } = require('../middleware/authMiddleware');

router.route('/').get(getPromociones).post(protect, soloAdmin, crearPromocion);

// Tiene que ir ANTES de "/:id", si no Express interpreta "admin" como si fuera un id
router.get('/admin/todas', protect, soloAdmin, getPromocionesAdmin);

router
  .route('/:id')
  .get(getPromocionById)
  .put(protect, soloAdmin, actualizarPromocion)
  .delete(protect, soloAdmin, eliminarPromocion);

module.exports = router;