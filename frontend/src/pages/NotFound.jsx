import { Link } from 'react-router-dom';

// Versión simple: en la etapa 6 se le da el diseño final
export default function NotFound() {
  return (
    <main>
      <h1>404</h1>
      <p>La página que buscás no existe.</p>
      <Link to="/">Volver al inicio</Link>
    </main>
  );
}
