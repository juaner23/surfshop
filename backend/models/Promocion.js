const mongoose = require('mongoose');

const TIPOS_PROMOCION = ['promocion', 'novedad'];
const REGEX_URL = /^https?:\/\/.+/i;

const promocionSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'El título no puede superar los 100 caracteres']
  },
  descripcion: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'La descripción no puede superar los 500 caracteres']
  },
  tipo: {
    type: String,
    enum: TIPOS_PROMOCION,
    required: true
  },
  // Solo tiene sentido cuando tipo = "promocion" (una "novedad" es solo un anuncio, sin descuento)
  descuentoPorcentaje: {
    type: Number,
    min: [0, 'El descuento no puede ser negativo'],
    max: [100, 'El descuento no puede superar el 100%']
  },
  // Opcional: a qué publicación puntual aplica. Si no se manda, se entiende que es general (todo el local).
  publicacionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Publicacion',
    required: false
  },
  fechaInicio: {
    type: Date,
    required: true
  },
  fechaFin: {
    type: Date,
    required: true,
    validate: {
      // "this" acá es el documento que se está creando/guardando (no funciona con findByIdAndUpdate,
      // por eso en el controller lo vamos a validar también a mano antes de actualizar)
      validator: function (v) {
        return !this.fechaInicio || v > this.fechaInicio;
      },
      message: 'La fecha de fin tiene que ser posterior a la fecha de inicio'
    }
  },
  imagen: {
    type: String,
    trim: true,
    match: [REGEX_URL, 'La imagen debe ser una URL válida (http:// o https://)']
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Promocion', promocionSchema);