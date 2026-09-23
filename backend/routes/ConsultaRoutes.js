const express = require('express');
const router = express.Router();
const {
  crearConsulta,
  getConsultas,
  getConsultaById,
  actualizarEstadoConsulta,
  eliminarConsulta,
} = require('../controllers/consultaControllers');
const { protect, soloAdmin } = require('../middleware/authMiddleware');

// El formulario de contacto es lo único público. Todo lo demás: solo el administrador.
router.route('/').get(protect, soloAdmin, getConsultas).post(crearConsulta);

router
  .route('/:id')
  .get(protect, soloAdmin, getConsultaById)
  .delete(protect, soloAdmin, eliminarConsulta);

router.route('/:id/estado').patch(protect, soloAdmin, actualizarEstadoConsulta);

module.exports = router;