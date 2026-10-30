import { Routes, Route } from 'react-router-dom';

import PublicLayout from '../layouts/PublicLayout.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';

import Inicio from '../pages/public/Inicio.jsx';
import Publicaciones from '../pages/public/Publicaciones.jsx';
import PublicacionDetalle from '../pages/public/PublicacionDetalle.jsx';
import Contacto from '../pages/public/Contacto.jsx';

import Login from '../pages/auth/Login.jsx';
import Registro from '../pages/auth/Registro.jsx';
import OlvidePassword from '../pages/auth/OlvidePassword.jsx';
import RestablecerPassword from '../pages/auth/RestablecerPassword.jsx';

import Dashboard from '../pages/admin/Dashboard.jsx';
import Perfil from '../pages/admin/Perfil.jsx';
import AdminPublicaciones from '../pages/admin/AdminPublicaciones.jsx';
import AdminCategorias from '../pages/admin/AdminCategorias.jsx';
import AdminConsultas from '../pages/admin/AdminConsultas.jsx';
import AdminComercio from '../pages/admin/AdminComercio.jsx';
import AdminPromociones from '../pages/admin/AdminPromociones.jsx';

import NotFound from '../pages/NotFound.jsx';

export default function AppRouter() {
  return (
    <Routes>
      {/* Sitio público */}
      <Route element={<PublicLayout />}>
        <Route index element={<Inicio />} />
        <Route path="publicaciones" element={<Publicaciones />} />
        <Route path="publicaciones/:id" element={<PublicacionDetalle />} />
        <Route path="contacto" element={<Contacto />} />

        {/* Pantallas de acceso (no necesitan sesión) */}
        <Route path="admin/login" element={<Login />} />
        <Route path="admin/registro" element={<Registro />} />
        <Route path="admin/olvide-password" element={<OlvidePassword />} />
        {/* Esta ruta coincide con el link que arma el backend en el mail de recuperación */}
        <Route path="restablecer-password/:token" element={<RestablecerPassword />} />
      </Route>

      {/* Panel de administración (en la etapa 4 se protege con sesión) */}
      <Route path="admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="perfil" element={<Perfil />} />
        <Route path="publicaciones" element={<AdminPublicaciones />} />
        <Route path="categorias" element={<AdminCategorias />} />
        <Route path="consultas" element={<AdminConsultas />} />
        <Route path="comercio" element={<AdminComercio />} />
        <Route path="promociones" element={<AdminPromociones />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
