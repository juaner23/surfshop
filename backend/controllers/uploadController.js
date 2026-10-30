const cloudinary = require('../config/cloudinary');

// Sube un archivo (que está en memoria, como Buffer) a Cloudinary y devuelve la URL pública.
const subirBuffer = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'aloha-surf-shop', resource_type: 'image' },
      (error, resultado) => (error ? reject(error) : resolve(resultado))
    );
    stream.end(buffer);
  });

// @desc    Subir una o varias imágenes a Cloudinary
// @route   POST /api/upload   (campo del formulario: "imagenes")
// @access  Privado/Admin
const subirImagenes = async (req, res) => {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    res.status(500);
    throw new Error('Falta configurar Cloudinary en el servidor');
  }

  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('No se envió ninguna imagen');
  }

  const resultados = await Promise.all(req.files.map((archivo) => subirBuffer(archivo.buffer)));

  // Devolvemos solo las URLs: es lo que guarda el modelo Publicacion en el campo "imagenes"
  res.status(201).json({ urls: resultados.map((r) => r.secure_url) });
};

module.exports = { subirImagenes };
