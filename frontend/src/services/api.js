// Capa de API: es el ÚNICO lugar del front que habla con el backend.
// Todo el resto de la app usa api(...) o los atajos api.get / api.post / ...

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'aloha_token';

// Evento que se dispara cuando el backend rechaza un token (venció o fue invalidado).
// El contexto de sesión (etapa 4) lo escucha para sacar al admin del panel.
export const EVENTO_SESION_VENCIDA = 'aloha:sesion-vencida';

// ---- Token (guardado en el navegador) ----
export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};
export const setToken = (token) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* sin almacenamiento disponible: la sesión dura solo hasta recargar */
  }
};
export const removeToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* nada que borrar */
  }
};

// Error propio: lleva el mensaje del backend y el código HTTP (0 = no hubo conexión)
export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Hace un pedido al backend.
 * @param {string} ruta   Ej: '/publicaciones?tipo=clase'  (sin la URL base)
 * @param {object} opciones
 *   - metodo: 'GET' (default) | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
 *   - cuerpo: objeto (se manda como JSON) o FormData (para subir imágenes)
 *   - auth:   true => manda el token en el header Authorization
 * @returns {Promise<any>} el JSON de la respuesta
 * @throws {ApiError}
 */
async function api(ruta, { metodo = 'GET', cuerpo, auth = false } = {}) {
  const headers = {};
  const token = auth ? getToken() : null;
  if (token) headers.Authorization = `Bearer ${token}`;

  const esFormData = typeof FormData !== 'undefined' && cuerpo instanceof FormData;
  if (cuerpo !== undefined && !esFormData) headers['Content-Type'] = 'application/json';

  let respuesta;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method: metodo,
      headers,
      body: cuerpo === undefined ? undefined : esFormData ? cuerpo : JSON.stringify(cuerpo),
    });
  } catch {
    // fetch solo falla así cuando no hay red o el servidor está caído
    throw new ApiError('No pudimos conectarnos con el servidor. Revisá tu conexión e intentá de nuevo.', 0);
  }

  let datos = null;
  try {
    datos = await respuesta.json();
  } catch {
    datos = null;
  }

  if (!respuesta.ok) {
    // Si mandamos un token y el backend dice 401, la sesión ya no sirve
    if (respuesta.status === 401 && token) {
      removeToken();
      window.dispatchEvent(new Event(EVENTO_SESION_VENCIDA));
    }
    throw new ApiError(datos?.message || 'Ocurrió un error inesperado', respuesta.status);
  }

  return datos;
}

// Atajos para escribir menos en las pantallas
api.get = (ruta, auth = false) => api(ruta, { auth });
api.post = (ruta, cuerpo, auth = false) => api(ruta, { metodo: 'POST', cuerpo, auth });
api.put = (ruta, cuerpo, auth = false) => api(ruta, { metodo: 'PUT', cuerpo, auth });
api.patch = (ruta, cuerpo, auth = false) => api(ruta, { metodo: 'PATCH', cuerpo, auth });
api.delete = (ruta, auth = false) => api(ruta, { metodo: 'DELETE', auth });

export default api;
