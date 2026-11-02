import { Routes, Route } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import Inicio from '../pages/public/Inicio.jsx';

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Inicio />} />
      </Route>
      <Route path="admin" element={<AdminLayout />}></Route>
    </Routes>
  );
}
