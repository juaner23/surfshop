const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/dashboardController');
const { protect, soloAdmin } = require('../middleware/authMiddleware');

// Todo el dashboard es privado: solo lo ve el administrador logueado
router.get('/', protect, soloAdmin, getDashboard);

module.exports = router;