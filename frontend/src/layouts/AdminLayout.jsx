import { Link, Outlet } from 'react-router-dom';

// Layout provisorio: en la etapa 2 se reemplaza por el menú lateral real
export default function AdminLayout() {
  return (
    <>
      <nav>
        <Link to="/admin">Resumen</Link>
        <Link to="/admin/publicaciones">Publicaciones</Link>
        <Link to="/admin/categorias">Categorías</Link>
        <Link to="/admin/consultas">Consultas</Link>
        <Link to="/admin/promociones">Promociones</Link>
        <Link to="/admin/comercio">Comercio</Link>
        <Link to="/admin/perfil">Perfil</Link>
        <Link to="/">Ver sitio</Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  );
}
