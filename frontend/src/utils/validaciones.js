// Mismas reglas que el modelo Consulta del back
export const REGEX_EMAIL = /^\S+@\S+\.\S+$/;
export const REGEX_TELEFONO = /^\+?[\d\s()-]{8,20}$/;

export function validarConsulta(valores, { requiereInteres = true } = {}) {
  const errores = {};

  const nombre = valores.nombre.trim();
  if (!nombre) errores.nombre = 'Ingresá tu nombre y apellido';
  else if (nombre.length > 100) errores.nombre = 'El nombre no puede superar los 100 caracteres';

  const email = valores.email.trim();
  if (!email) errores.email = 'Ingresá tu email';
  else if (!REGEX_EMAIL.test(email)) errores.email = 'El email no tiene un formato válido';
  else if (email.length > 100) errores.email = 'El email no puede superar los 100 caracteres';

  const telefono = valores.telefono.trim();
  if (telefono && !REGEX_TELEFONO.test(telefono)) {
    errores.telefono = 'El teléfono no es válido (8 a 20 caracteres: números, +, espacios, guiones o paréntesis)';
  }

  const disponibilidad = valores.disponibilidad.trim();
  if (!disponibilidad) errores.disponibilidad = 'Contanos cuándo podés';
  else if (disponibilidad.length > 100) errores.disponibilidad = 'La disponibilidad no puede superar los 100 caracteres';

  if (requiereInteres && !valores.interes) errores.interes = 'Elegí una opción';

  const mensaje = valores.mensaje.trim();
  if (!mensaje) errores.mensaje = 'Escribí tu mensaje';
  else if (mensaje.length > 1000) errores.mensaje = 'El mensaje no puede superar los 1000 caracteres';

  return errores;
}