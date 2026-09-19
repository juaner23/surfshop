const express = require('express');
const router = express.Router();
const {
  crearConsulta,
  getConsultas,
  getConsultaById,
  actualizarEstadoConsulta,
  eliminarConsulta,
} = require('../controllers/consultaControllers');

router.route('/').get(getConsultas).post(crearConsulta);

router.route('/:id').get(getConsultaById).delete(eliminarConsulta);

router.route('/:id/estado').patch(actualizarEstadoConsulta);

module.exports = router;