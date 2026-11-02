import { Link, Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <>
      <nav className="navbar-public">
        <div className="nav-logo">Aloha<br/><span>SURF SHOP</span></div>
        <div className="nav-links">
          <Link to="/">Inicio</Link>
          <Link to="/publicaciones?tipo=clase">Clases</Link>
          <Link to="/publicaciones">Productos</Link>
          <Link to="/contacto">Contacto</Link>
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
            <Link to="/publicaciones?tipo=clase">Clases</Link>
            <Link to="/publicaciones">Productos</Link>
            <Link to="/contacto">Contacto</Link>
          </div>
        </div>
      </footer>
    </>
  );
}