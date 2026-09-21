// Valida la contraseña original (antes de hashearla).
// Devuelve un array con los errores encontrados; si está vacío, la contraseña es válida.
const validarPassword = (password) => {
  if (typeof password !== 'string' || password.length === 0) {
    return ['La contraseña es obligatoria'];
  }

  const errores = [];

  if (password.length < 8) errores.push('debe tener al menos 8 caracteres');
  if (password.length > 64) errores.push('no puede superar los 64 caracteres');
  if (!/[a-z]/.test(password)) errores.push('debe incluir al menos una minúscula');
  if (!/[A-Z]/.test(password)) errores.push('debe incluir al menos una mayúscula');
  if (!/\d/.test(password)) errores.push('debe incluir al menos un número');
  if (!/[^A-Za-z0-9\s]/.test(password)) errores.push('debe incluir al menos un símbolo (ej. ! # $ %)');
  if (/\s/.test(password)) errores.push('no puede tener espacios');

  return errores;
};

module.exports = { validarPassword };