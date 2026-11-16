import { Link } from 'react-router-dom';
import IconoOndas from './IconoOndas.jsx';

export default function BannerNivel() {
  return (
    <section className="banner-nivel">
      <IconoOndas size={44} className="banner-nivel__icono" />
      <div className="banner-nivel__texto">
        <h2 className="banner-nivel__titulo">¿No sabés tu nivel?</h2>
        <p className="banner-nivel__desc">
          Contanos tu experiencia y qué te gustaría aprender. Te ayudamos a encontrar la clase para vos.
        </p>
      </div>
      <Link to="/contacto" className="banner-nivel__btn">
        Contactanos <span aria-hidden="true">↗</span>
      </Link>
    </section>
  );
}