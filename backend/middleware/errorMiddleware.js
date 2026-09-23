// Middleware de manejo de errores centralizado.
// Con Express 5, si un controller async tira un error (throw) o rechaza una promesa,
// Express lo agarra solo y lo manda para acá. Así evitamos repetir try/catch en cada controller.

// Se ejecuta cuando ninguna ruta matcheó la URL pedida (siempre va al final de todas las rutas).
const notFound = (req, res, next) => {
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
  res.status(404);
  next(error); // le pasamos el error al errorHandler de abajo
};

// Middleware de errores "real": Express lo reconoce como tal porque tiene 4 parámetros (err primero).
// Tiene que ser el ÚLTIMO app.use() del server.
const errorHandler = (err, req, res, next) => {
  // Si el controller ya seteó un status de error (ej. res.status(404) antes del throw), lo respetamos.
  // Si nadie seteó nada, el status va a haber quedado en 200, así que lo pasamos a 500.
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Mongoose: alguien mandó un id con formato inválido (ej. "abc123" en vez de un ObjectId real).
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Recurso no encontrado';
  }

  // Mongoose: se violó un índice unique (ej. email o nombre de categoría repetido).
  if (err.code === 11000) {
    const campo = Object.keys(err.keyValue).join(', ');
    statusCode = 400;
    message = `Ya existe un registro con ese valor en el campo: ${campo}`;
  }

  // Mongoose: fallaron las validaciones del schema (required, enum, minlength, etc.).
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((val) => val.message).join('. ');
  }

  // Siempre queda registrado en la consola del servidor, aunque al cliente le mandemos un mensaje genérico.
  // Así el admin/desarrollador puede ver el detalle real sin exponerlo afuera.
  if (statusCode >= 500) {
    console.error(err);
  }

  // Un 500 significa que fue un error no esperado (bug, caída de la base, etc.).
  // No mandamos err.message al cliente porque puede filtrar detalles internos
  // (rutas de archivos, mensajes de MongoDB, nombres de variables, etc.).
  if (statusCode >= 500) {
    message = 'Ocurrió un error interno del servidor';
  }

  // El stack solo se manda si estamos EXPLÍCITAMENTE en desarrollo.
  // (antes se ocultaba solo si NODE_ENV === 'production'; si esa variable no estaba
  // seteada en el .env, el stack se filtraba igual. Así queda seguro por defecto.)
  const mostrarStack = process.env.NODE_ENV === 'development';

  res.status(statusCode).json({
    message,
    ...(mostrarStack && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };