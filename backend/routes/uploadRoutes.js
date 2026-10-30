const express = require('express');
const multer = require('multer');
const router = express.Router();
const { subirImagenes } = require('../controllers/uploadController');
const { protect, soloAdmin } = require('../middleware/authMiddleware');

const MAX_MB = 5;
const MAX_ARCHIVOS = 10;

// Los archivos quedan en memoria (no se guardan en disco): van directo a Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_MB * 1024 * 1024, files: MAX_ARCHIVOS },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Solo se permiten archivos de imagen'));
    }
    cb(null, true);
  },
});

// Envolvemos multer para devolver errores claros (400) en vez de un 500 genérico
const recibirImagenes = (req, res, next) => {
  upload.array('imagenes', MAX_ARCHIVOS)(req, res, (error) => {
    if (!error) return next();

    res.status(400);
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return next(new Error(`Cada imagen puede pesar hasta ${MAX_MB} MB`));
      }
      if (error.code === 'LIMIT_FILE_COUNT' || error.code === 'LIMIT_UNEXPECTED_FILE') {
        return next(new Error(`Podés subir hasta ${MAX_ARCHIVOS} imágenes por vez`));
      }
    }
    next(error);
  });
};

// Solo el administrador logueado puede subir imágenes
router.post('/', protect, soloAdmin, recibirImagenes, subirImagenes);

module.exports = router;
