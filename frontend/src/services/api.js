const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
async function api(ruta, { metodo = 'GET', cuerpo } = {}) {
  const res = await fetch(`${API_URL}${ruta}`);
  return res.json();
}
api.get = (ruta) => api(ruta);
export default api;
