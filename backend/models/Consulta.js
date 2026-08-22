const mongoose = require('mongoose');

const consultaSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  telefono: { type: String, trim: true },
  asunto: { type: String, required: true, trim: true },
  mensaje: { type: String, required: true },
  estado: { 
    type: String, 
    enum: ['pendiente', 'leida', 'respondida'], 
    default: 'pendiente' 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Consulta', consultaSchema);