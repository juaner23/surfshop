const mongoose = require('mongoose');

const REGEX_EMAIL = /^\S+@\S+\.\S+$/;
const REGEX_TELEFONO = /^\+?[\d\s()-]{8,20}$/;

const consultaSchema = new mongoose.Schema({
  publicacionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Publicacion',
    required: false // null = consulta general "Contacto"; con valor = consulta sobre esa publicación
  },
  nombre: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'El nombre no puede superar los 100 caracteres']
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    maxlength: [100, 'El email no puede superar los 100 caracteres'],
    match: [REGEX_EMAIL, 'El email no tiene un formato válido']
  },
  telefono: {
    type: String,
    trim: true,
    maxlength: [20, 'El teléfono no puede superar los 20 caracteres'],
    validate: {
      // Es opcional: solo se valida el formato si vino un valor
      validator: (v) => !v || REGEX_TELEFONO.test(v),
      message: 'El teléfono no es válido (entre 8 y 20 caracteres: números, +, espacios, guiones o paréntesis)'
    }
  },
  asunto: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'El asunto no puede superar los 100 caracteres']
  },
  mensaje: {
    type: String,
    required: true,
    trim: true,
    maxlength: [1000, 'El mensaje no puede superar los 1000 caracteres']
  },
  estado: {
    type: String,
    enum: ['pendiente', 'leida', 'respondida'],
    default: 'pendiente'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Consulta', consultaSchema);