const mongoose = require('mongoose');

const tokenInvalidadoSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  token: { type: String, required: true }, // el JWT que quedó invalidado al cerrar sesión
  expiraEn: { type: Date, required: true } // misma fecha en la que el JWT iba a vencer solo
});

// Mismo índice TTL: no tiene sentido guardar en la lista negra un token para siempre,
// una vez que el JWT venció por su cuenta ya no hace falta seguir bloqueándolo.
tokenInvalidadoSchema.index({ expiraEn: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('TokenInvalidado', tokenInvalidadoSchema);
