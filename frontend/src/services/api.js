const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Error con el mensaje que devuelve el back ({ message }) y el código HTTP
export class ApiError extends Error {
  constructor(mensaje, status = 0) {
    super(mensaje);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function api(ruta, { metodo = 'GET', cuerpo, token } = {}) {
  const headers = {};
  if (cuerpo !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_URL}${ruta}`, {
      method: metodo,
      headers,
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
    });
  } catch {
    throw new ApiError('No pudimos conectarnos con el servidor. Revisá tu conexión e intentá de nuevo.');
  }

  let datos = null;
  try {
    datos = await res.json();
  } catch {
    // la respuesta no tenía cuerpo JSON
  }

  if (!res.ok) {
    throw new ApiError(datos?.message || 'Ocurrió un error inesperado', res.status);
  }
  return datos;
}

api.get = (ruta, opciones) => api(ruta, { ...opciones, metodo: 'GET' });
api.post = (ruta, cuerpo, opciones) => api(ruta, { ...opciones, metodo: 'POST', cuerpo });
api.put = (ruta, cuerpo, opciones) => api(ruta, { ...opciones, metodo: 'PUT', cuerpo });
api.delete = (ruta, opciones) => api(ruta, { ...opciones, metodo: 'DELETE' });

export default api;