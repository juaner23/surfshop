const crypto = require('crypto');
const ResetToken = require('../models/ResetToken');
const { enviarMail } = require('./enviarMail');

const UNA_HORA = 60 * 60 * 1000;

// En la base guardamos el HASH del token, no el token en sí:
// así, aunque alguien viera la colección, no podría usar ningún link.
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

// Crea un token nuevo (borrando los anteriores del usuario) y le manda el mail con el link.
// motivo: 'solicitud' (pidió recuperar) o 'bloqueo' (la cuenta se bloqueó por intentos fallidos)
const enviarMailRestablecer = async (usuario, motivo = 'solicitud') => {
  const token = crypto.randomBytes(32).toString('hex');

  await ResetToken.deleteMany({ usuarioId: usuario._id });
  await ResetToken.create({
    usuarioId: usuario._id,
    token: hashToken(token),
    expiraEn: new Date(Date.now() + UNA_HORA),
  });

  const base = process.env.FRONTEND_URL || 'http://localhost:5173';
  const link = `${base}/restablecer-password/${token}`;

  const intro =
    motivo === 'bloqueo'
      ? 'Tu cuenta se bloqueó por 15 minutos después de 3 intentos fallidos de ingreso. Si fuiste vos, podés esperar y volver a probar, o restablecer tu contraseña ahora.'
      : 'Recibimos un pedido para restablecer tu contraseña.';

  await enviarMail({
    para: usuario.email,
    asunto: 'Restablecer tu contraseña - Surf Shop',
    texto:
      `Hola ${usuario.nombre}!\n\n${intro}\n\n` +
      `Entrá a este link (vale 1 hora):\n${link}\n\n` +
      `Si el link no abre, tu código es:\n${token}\n\n` +
      `Si no fuiste vos, ignorá este mail.`,
    html:
      `<p>Hola ${usuario.nombre}!</p><p>${intro}</p>` +
      `<p><a href="${link}">Restablecer mi contraseña</a> (vale 1 hora)</p>` +
      `<p>Si el link no abre, tu código es:<br><code>${token}</code></p>` +
      `<p>Si no fuiste vos, ignorá este mail.</p>`,
  });
};

module.exports = { hashToken, enviarMailRestablecer };