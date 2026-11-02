import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './Inicio.css';

export default function Inicio() {
  const [destacados, setDestacados] = useState([]);

  useEffect(() => {
    api.get('/publicaciones?destacado=true')
      .then(data => setDestacados(data.slice(0, 5)))
      .catch(error => console.error('Error al cargar destacados:', error));
  }, []);

  const scrollToSobreNosotros = (e) => {
    e.preventDefault();
    document.getElementById('sobre-nosotros').scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="inicio-container">
      <section className="hero-section">
        <div className="hero-overlay">
          <p className="hero-subtitle">SURF, SAL Y BUENA ENERGÍA</p>
          <h1 className="hero-title">El mar nos encuentra.</h1>
          <p className="hero-text">
            Somos Aloha Surf Shop. Tablas, equipo y clases para disfrutar del surf a tu manera.
          </p>
          <div className="hero-actions">
            <button onClick={scrollToSobreNosotros} className="btn-light">Conocé más</button>
            <Link to="/contacto" className="btn-primary">Contactanos</Link>
          </div>
          
          <div className="hero-bottom-text">
            LISTOS PARA TU PRÓXIMA OLA
          </div>
        </div>
      </section>

      <section className="destacados-section">
        <h2 className="section-title">Nuestros destacados</h2>
        <p className="section-subtitle">Cinco elegidos para entrar al agua.</p>
        
        <div className="destacados-grid">
          {destacados.length > 0 ? (
            destacados.map((item) => (
              <div key={item._id} className="card-destacado">
                <div className="card-image-wrapper">
                  <img src={item.imagenes[0]} alt={item.nombre} />
                </div>
                <div className="card-info">
                  <span className="card-category">{item.categoriaId?.nombre || item.tipo}</span>
                  <h3 className="card-name">{item.nombre}</h3>
                  <p className="card-price">${item.precio.toLocaleString('es-AR')}</p>
                </div>
              </div>
            ))
          ) : (
            <p>Cargando destacados...</p>
          )}
        </div>
        <div className="destacados-footer">
          <Link to="/publicaciones" className="link-todos">Todos los productos ↗</Link>
        </div>
      </section>

      <div className="sobre-nosotros-wrapper">
        <section id="sobre-nosotros" className="sobre-nosotros-section">
          <div className="sobre-nosotros-image"></div>
          <div className="sobre-nosotros-content">
            <span className="section-pre-title">EL ESPÍRITU ALOHA</span>
            <h2>Sobre nosotros</h2>
            <h3>Una tienda de surf.<br/>Un punto de encuentro.</h3>
            <p>En Aloha compartimos las ganas de estar cerca del mar. Nos gustan las charlas sobre olas, encontrar la tabla indicada y preparar todo para la próxima sesión.</p>
            <p>Si estás dando tus primeros pasos o ya tenés tu ritual antes de entrar al agua, este también es tu lugar. Equipo, clases y buena energía para vivir el surf a tu manera.</p>
            <p className="firma-aloha">〰️ NOS VEMOS EN EL AGUA.</p>
          </div>
        </section>
      </div>
    </div>
  );
}