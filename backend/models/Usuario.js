const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  apellido: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'El email no tiene un formato válido']
  },
  telefono: { type: String, required: true, trim: true },
  // select: false => la consulta NO trae el hash salvo que lo pidamos a propósito
  passwordHash: { type: String, required: true, select: false },
  rol: { type: String, enum: ['administrador'], default: 'administrador' },
  passwordCambiadaEn: { type: Date, default: Date.now },

  // Control de bloqueo por intentos fallidos
  intentosFallidos: { type: Number, default: 0 },
  bloqueadoHasta: { type: Date, default: null }
}, {
  timestamps: true
});

// true si la cuenta sigue bloqueada en este momento
usuarioSchema.methods.estaBloqueado = function () {
  return !!this.bloqueadoHasta && this.bloqueadoHasta > Date.now();
};

module.exports = mongoose.model('Usuario', usuarioSchema);