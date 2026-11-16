import { Routes, Route } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import Inicio from '../pages/public/Inicio.jsx';
import Clases from '../pages/public/Clases.jsx';
import Publicaciones from '../pages/public/Publicaciones.jsx';
import PublicacionDetalle from '../pages/public/PublicacionDetalle.jsx';
import Contacto from '../pages/public/Contacto.jsx';
import NotFound from '../pages/NotFound.jsx';

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Inicio />} />
        <Route path="clases" element={<Clases />} />
        <Route path="clases/:id" element={<PublicacionDetalle />} />
        <Route path="publicaciones" element={<Publicaciones />} />
        <Route path="publicaciones/:id" element={<PublicacionDetalle />} />
        <Route path="contacto" element={<Contacto />} />
      </Route>
      <Route path="admin" element={<AdminLayout />}></Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}