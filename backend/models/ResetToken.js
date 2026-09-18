const mongoose = require('mongoose');

const resetTokenSchema = new mongoose.Schema({
  usuarioId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
  token: { type: String, required: true },
  expiraEn: { type: Date, required: true }
});

// Índice TTL: Mongo borra el documento solo, apenas se cumple la fecha de "expiraEn".
// expireAfterSeconds: 0 significa "en el momento exacto que indica el campo", no X segundos después.
resetTokenSchema.index({ expiraEn: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('ResetToken', resetTokenSchema);
