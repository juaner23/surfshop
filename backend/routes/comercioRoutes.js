const express = require('express');
const router = express.Router();
const { getComercio, actualizarComercio } = require('../controllers/comercioController');
const { protect, soloAdmin } = require('../middleware/authMiddleware');

// Ver la info del comercio es público (la usa el sitio). Crear/editar: solo el administrador.
router.route('/').get(getComercio).put(protect, soloAdmin, actualizarComercio);

module.exports = router;