import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import TarjetaClase from '../../components/TarjetaClase.jsx';
import BannerNivel from '../../components/BannerNivel.jsx';
import './Clases.css';

const ORDEN_NIVELES = ['principiante', 'intermedio', 'profesional'];
const esGrupal = (clase) => /grupal/i.test(clase.nombre);

export default function Clases() {
  const [clases, setClases] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const data = await api.get('/publicaciones?tipo=clase');
    // Primero las individuales por nivel; las que dicen "grupal" en el nombre van al final
      const ordenadas = [...data].sort((a, b) => {
        if (esGrupal(a) !== esGrupal(b)) return esGrupal(a) ? 1 : -1;
        return ORDEN_NIVELES.indexOf(a.nivel) - ORDEN_NIVELES.indexOf(b.nivel);
      });

      setClases(ordenadas);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Clases | Aloha Surf Shop';
    cargar();
  }, [cargar]);

  return (
    <div className="clases-page">
      <div className="clases-inner">
        <header className="clases-header">
          <p className="clases-eyebrow">SURF A TU RITMO</p>
          <h1 className="clases-title">Una clase para cada ola.</h1>
          <p className="clases-intro">
            Del primer encuentro con el mar a los detalles de tu técnica. Elegí tu nivel y
            descubrí qué podemos trabajar en el agua.
          </p>
        </header>

        {cargando && (
          <div className="clases-grid" aria-busy="true" aria-label="Cargando clases">
            {[1, 2, 3].map((n) => (
              <div key={n} className="clase-skeleton" />
            ))}
          </div>
        )}

        {!cargando && error && (
          <div className="clases-estado" role="alert">
            <p>{error}</p>
            <button type="button" className="clases-estado__accion" onClick={cargar}>
              Reintentar
            </button>
          </div>
        )}

        {!cargando && !error && clases.length === 0 && (
          <div className="clases-estado">
            <p>Por ahora no hay clases publicadas. Escribinos y te contamos.</p>
            <Link to="/contacto" className="clases-estado__accion">Contactanos</Link>
          </div>
        )}

        {!cargando && !error && clases.length > 0 && (
          <>
            <div className="clases-grid">
              {clases.map((clase) => (
                <TarjetaClase key={clase._id} clase={clase} />
              ))}
            </div>

            <div className="clases-notas">
              <p>Tarifas orientativas por persona, en pesos argentinos. Confirmá el valor y el equipo al consultar.</p>
              <p>Los horarios y la realización de la clase se coordinan según disponibilidad y condiciones del mar.</p>
            </div>
          </>
        )}

        <BannerNivel />
      </div>
    </div>
  );
}