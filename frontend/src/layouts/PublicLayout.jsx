import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

export default function PublicLayout() {
  const { pathname } = useLocation();
  const esInicio = pathname === '/';

  // Al cambiar de página, volver arriba
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <nav className={`navbar-public${esInicio ? '' : ' navbar-public--solid'}`}>
        <Link to="/" className="nav-logo-link" aria-label="Aloha Surf Shop - Inicio">
          <div className="nav-logo">Aloha<br/><span>SURF SHOP</span></div>
        </Link>
        <div className="nav-links">
          <NavLink to="/" end>Inicio</NavLink>
          <NavLink to="/clases">Clases</NavLink>
          <NavLink to="/publicaciones">Productos</NavLink>
          <NavLink to="/contacto">Contacto</NavLink>
          <Link to="/admin/login" className="btn-panel">Mi panel</Link>
        </div>
      </nav>

      <main><Outlet /></main>

      <footer className="footer-public">
        <div className="footer-col-1">
          <div className="footer-logo">Aloha<br/><span>SURF SHOP</span></div>
          <p className="copyright">© Aloha Surf Shop</p>
        </div>
        <div className="footer-col-2">
          <h2>La buena energía se comparte.</h2>
        </div>
        <div className="footer-col-3">
          <p className="social-title">SEGUÍ LA OLA</p>
          <div className="social-links">
            <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram ↗</a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook ↗</a>
          </div>
          <div className="footer-nav">
            <Link to="/clases">Clases</Link>
            <Link to="/publicaciones">Productos</Link>
            <Link to="/contacto">Contacto</Link>
          </div>
        </div>
      </footer>
    </>
  );
}