const nodemailer = require('nodemailer');

// Datos de la cuenta que envía los mails (salen del .env)
const crearTransporte = () =>
  nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.MAIL_PORT) || 465,
    secure: true,
    auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
  });

// Envía un mail. Recibe: { para, asunto, texto, html }
const enviarMail = async ({ para, asunto, texto, html }) => {
  if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
    throw new Error('Falta configurar MAIL_USER y MAIL_PASS en el .env');
  }

  const transporte = crearTransporte();
  return transporte.sendMail({
    from: `"Surf Shop" <${process.env.MAIL_USER}>`,
    to: para,
    subject: asunto,
    text: texto,
    html,
  });
};

module.exports = { enviarMail };