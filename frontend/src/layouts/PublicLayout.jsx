import { Link, Outlet } from 'react-router-dom';

// Layout provisorio: en la etapa 2 se reemplaza por el navbar y footer reales
export default function PublicLayout() {
  return (
    <>
      <nav>
        <Link to="/">Inicio</Link>
        <Link to="/publicaciones">Publicaciones</Link>
        <Link to="/contacto">Contacto</Link>
        <Link to="/admin/login">Admin</Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  );
}
