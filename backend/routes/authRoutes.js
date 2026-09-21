const express = require('express');
const router = express.Router();
const { registro, login, perfil, logout } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/registro', registro);
router.post('/login', login);
router.get('/me', protect, perfil);
router.post('/logout', protect, logout);

module.exports = router;