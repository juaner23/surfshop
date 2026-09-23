const mongoose = require('mongoose');

const REGEX_EMAIL = /^\S+@\S+\.\S+$/;
const REGEX_TELEFONO = /^\+?[\d\s()-]{8,20}$/;

const comercioInfoSchema = new mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    nombre: { type: String, required: true, default: 'Aloha Surf Shop' },
    descripcion: { type: String, required: true },
    direccion: { type: String, required: true },
    telefono: {
      type: String,
      required: true,
      trim: true,
      match: [REGEX_TELEFONO, 'El teléfono no es válido (entre 8 y 20 caracteres: números, +, espacios, guiones o paréntesis)']
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [REGEX_EMAIL, 'El email no tiene un formato válido']
    },
    horarios: { type: String, required: true }, // texto libre, ej. "Lunes a viernes de 9 a 18hs"
    redesSociales: {
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
    tiktok: { type: String, default: '' }
    }
}, {
  timestamps: true
});

module.exports = mongoose.model('ComercioInfo', comercioInfoSchema, 'comercio');