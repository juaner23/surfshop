const mongoose = require('mongoose');

const comercioInfoSchema = new mongoose.Schema({
    nombre: { type: String, required: true, default: 'Aloha Surf Shop' },
    descripcion: { type: String, required: true },
    direccion: { type: String, required: true },
    telefono: { type: String, required: true },
    email: { type: String, required: true },
    horarios: { type: String, required: true },
    redesSociales: {
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    whatsapp: { type: String, default: '' }
    }
}, {
  timestamps: true
});

module.exports = mongoose.model('ComercioInfo', comercioInfoSchema);