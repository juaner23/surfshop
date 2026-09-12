const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  apellido: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  telefono: { type: String, required: true },
  passwordHash: { type: String, required: true }, // nunca se guarda la contraseña en texto plano
  rol: { type: String, enum: ['administrador'], default: 'administrador' }
}, {
  timestamps: true // Agregafecha de creación y actualización
});

module.exports = mongoose.model('Usuario', usuarioSchema);