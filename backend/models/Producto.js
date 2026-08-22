const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  tipo: { 
    type: String, 
    enum: ['producto', 'servicio'], 
    default: 'producto' 
  },
  categoria: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Categoria', 
    required: true 
  },
  descripcion: { type: String, required: true },
  precio: { type: Number, default: 0 },
  imagenes: [{ type: String, required: true }], // Soporta múltiples imágenes (da puntaje extra)
  disponible: { type: Boolean, default: true },
  destacado: { type: Boolean, default: false } // Para productos destacados (puntaje extra)
}, {
  timestamps: true
});

module.exports = mongoose.model('Producto', productoSchema);

