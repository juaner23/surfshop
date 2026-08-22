const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  apellido: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  telefono: { type: String, required: true },
  password: { type: String, required: true },
  resetPasswordToken: { type: String }, // Para la recuperación de contraseña
  resetPasswordExpire: { type: Date }
}, {
  timestamps: true // Agregafecha de creación y actualización
});

module.exports = mongoose.model('Usuario', usuarioSchema);