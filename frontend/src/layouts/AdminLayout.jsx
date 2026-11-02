import { Link, Outlet } from 'react-router-dom';
export default function AdminLayout() {
  return (
    <>
      <nav>
        <Link to="/admin">Resumen</Link>
        <Link to="/admin/publicaciones">Publicaciones</Link>
        <Link to="/">Ver sitio</Link>
      </nav>
      <main><Outlet /></main>
    </>
  );
}
