const express = require('express');
const router = express.Router();
const { registro, login, perfil, logout, actualizarPerfil, forgotPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/registro', registro);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.get('/me', protect, perfil);
router.put('/me', protect, actualizarPerfil);
router.post('/logout', protect, logout);

module.exports = router;