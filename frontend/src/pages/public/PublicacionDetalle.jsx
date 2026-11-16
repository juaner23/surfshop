import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import api from '../../services/api';
import { TEXTO_UNIDAD, formatearPrecio } from '../../utils/formato.js';
import './PublicacionDetalle.css';

/* ---------- Textos fijos (se usan mientras la base no tenga un campo "detalle") ---------- */
const TEXTOS_POR_NIVEL = {
  principiante: {
    etiqueta: 'TU PRIMER ENCUENTRO CON EL SURF',
    frase: 'La primera ola empieza acá.',
    paraQuien:
      'Para vos si nunca surfeaste o todavía estás practicando cómo ponerte de pie. Es importante que sepas nadar y te sientas cómodo en el agua.',
  },
  intermedio: {
    etiqueta: 'TU SIGUIENTE PASO EN EL AGUA',
    frase: 'Ahora a recorrer la pared.',
    paraQuien:
      'Para vos si ya te ponés de pie y querés mejorar tu remada y elegir mejor las olas. Es importante que sepas nadar y te sientas cómodo en el agua.',
  },
  profesional: {
    etiqueta: 'PARA QUIENES YA RECORREN LA OLA',
    frase: 'Cada maniobra cuenta.',
    paraQuien:
      'Para vos si ya recorrés la ola y querés pulir maniobras, fluidez y lectura de condiciones. Es importante que te sientas cómodo en el agua.',
  },
};

const TEXTOS_GRUPAL = {
  etiqueta: 'SURF PARA COMPARTIR',
  frase: 'El mar se disfruta más en grupo.',
  paraQuien:
    'Para compartir con amigos o familia. Es importante que sepan nadar y se sientan cómodos en el agua.',
};

const TEXTOS_CLASE_GENERICO = {
  etiqueta: 'CLASES DE SURF',
  frase: '',
  paraQuien: 'Es importante que sepas nadar y te sientas cómodo en el agua.',
};

const RECOMENDACIONES_CLASE =
  'Traé traje de baño, toalla, agua y protección solar. Contanos si necesitás tabla o neoprene para consultar las opciones de equipo.';

const esGrupal = (p) => /grupal/i.test(p.nombre);

function textosDe(p) {
  if (p.tipo !== 'clase') {
    return {
      etiqueta: p.categoriaId?.nombre?.toUpperCase() || '',
      frase: '',
      paraQuien: 'Escribinos para consultar disponibilidad y coordinar.',
    };
  }
  if (esGrupal(p)) return TEXTOS_GRUPAL;
  return TEXTOS_POR_NIVEL[p.nivel] || TEXTOS_CLASE_GENERICO;
}

/* ---------- Íconos ---------- */
const propsIcono = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: false,
};

const IconoVolver = () => (
  <svg width="16" height="16" {...propsIcono}>
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </svg>
);

const IconoCheck = () => (
  <svg width="16" height="16" {...propsIcono}>
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const IconoSol = () => (
  <svg width="20" height="20" {...propsIcono}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

/* ---------- Página ---------- */
export default function PublicacionDetalle() {
  const { id } = useParams();
  const { pathname } = useLocation();
  const [publicacion, setPublicacion] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      setPublicacion(await api.get(`/publicaciones/${id}`));
    } catch (e) {
      setPublicacion(null);
      setError({ mensaje: e.message, status: e.status });
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    if (publicacion) document.title = `${publicacion.nombre} | Aloha Surf Shop`;
  }, [publicacion]);

  if (cargando) {
    return (
      <div className="detalle-page">
        <div className="detalle-inner">
          <div className="detalle-skeleton" aria-busy="true" aria-label="Cargando" />
        </div>
      </div>
    );
  }

  if (error || !publicacion) {
    const noExiste = error?.status === 404;
    return (
      <div className="detalle-page">
        <div className="detalle-inner">
          <div className="detalle-estado" role="alert">
            <p>
              {noExiste
                ? 'No encontramos esta publicación. Puede que ya no esté disponible.'
                : error?.mensaje || 'Ocurrió un error inesperado'}
            </p>
            {noExiste ? (
              <Link to="/clases" className="detalle-estado__accion">Ver las clases</Link>
            ) : (
              <button type="button" className="detalle-estado__accion" onClick={cargar}>
                Reintentar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const esClase = publicacion.tipo === 'clase';
  const enRutaClases = pathname.startsWith('/clases/');

  // Cada tipo vive en su propia ruta (así el navbar marca la sección correcta)
  if (esClase && !enRutaClases) return <Navigate to={`/clases/${publicacion._id}`} replace />;
  if (!esClase && enRutaClases) return <Navigate to={`/publicaciones/${publicacion._id}`} replace />;

  const textos = textosDe(publicacion);
  // Más adelante, si la publicación trae un bloque "detalle", tiene prioridad sobre los textos fijos
  const detalle = publicacion.detalle || {};
  const etiqueta = detalle.etiqueta || textos.etiqueta;
  const frase = detalle.subtitulo || textos.frase;
  const textoPrincipal = detalle.descripcionLarga || publicacion.descripcion;
  const temario = Array.isArray(detalle.temario) ? detalle.temario : [];
  const recomendaciones = detalle.recomendaciones || (esClase ? RECOMENDACIONES_CLASE : '');

  const disponible = publicacion.estado === 'disponible';
  const imagenes = (publicacion.imagenes || []).slice(0, 3);
  const unidad = TEXTO_UNIDAD[publicacion.unidadPrecio];
  const tienePrecio = publicacion.precio > 0;
  const aclaracionPrecio = esClase
    ? `${publicacion.unidadPrecio === 'grupo' ? 'Por grupo' : 'Por persona'} · tarifa orientativa en ARS`
    : 'Precio en pesos argentinos';
  const volver = esClase
    ? { to: '/clases', texto: 'Todas las clases' }
    : { to: '/publicaciones', texto: 'Todos los productos' };

  return (
    <div className="detalle-page">
      <div className="detalle-inner">
        <Link to={volver.to} className="detalle-volver">
          <IconoVolver /> {volver.texto}
        </Link>

        <header className="detalle-cabecera">
          <div>
            {etiqueta && <p className="detalle-eyebrow">{etiqueta}</p>}
            <h1 className="detalle-titulo">{publicacion.nombre}</h1>
            {frase && <p className="detalle-frase">{frase}</p>}
          </div>

          <div className="detalle-precio-bloque">
            <p className="detalle-precio">
              {tienePrecio ? formatearPrecio(publicacion.precio) : 'Consultar'}
              {tienePrecio && unidad && <span>/ {unidad}</span>}
            </p>
            {tienePrecio && <p className="detalle-precio-nota">{aclaracionPrecio}</p>}
            {!disponible && <p className="detalle-no-disponible">No disponible por el momento</p>}
          </div>
        </header>

        {imagenes.length > 0 && (
          <div className={`detalle-galeria detalle-galeria--${imagenes.length}`}>
            {imagenes.map((src, i) => (
              <figure key={`${i}-${src}`} className="detalle-foto">
                <img
                  src={src}
                  alt={i === 0 ? publicacion.nombre : `${publicacion.nombre} - foto ${i + 1}`}
                  onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                />
              </figure>
            ))}
          </div>
        )}

        <div className="detalle-contenido">
          <div className="detalle-principal">
            <h2 className="detalle-subtitulo">{esClase ? 'Sobre esta clase' : 'Detalles'}</h2>
            <p className="detalle-texto">{textoPrincipal}</p>

            {temario.length > 0 && (
              <section aria-labelledby="titulo-temario">
                <h3 id="titulo-temario" className="detalle-eyebrow">QUÉ VAMOS A TRABAJAR</h3>
                <ul className="detalle-temario">
                  {temario.map((item, i) => (
                    <li key={i}>
                      <span className="detalle-check"><IconoCheck /></span>
                      <div>
                        <p className="detalle-temario__titulo">{item.titulo}</p>
                        {item.detalle && <p className="detalle-temario__detalle">{item.detalle}</p>}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="detalle-aside">
            <div className="detalle-caja">
              <p className="detalle-eyebrow">{esClase ? 'TU PRÓXIMO PASO' : 'CONSULTÁ'}</p>
              <h2 className="detalle-caja__titulo">{esClase ? '¿Vamos al agua?' : '¿Te interesa?'}</h2>
              <p className="detalle-caja__texto">{textos.paraQuien}</p>
              <Link to={`/contacto?publicacion=${publicacion._id}`} className="detalle-btn">
                Consultar {publicacion.nombre} <span aria-hidden="true">↗</span>
              </Link>
              <p className="detalle-caja__nota">
                Escribinos para coordinar. Enviar una consulta no confirma una reserva ni requiere un pago.
              </p>
            </div>

            {recomendaciones && (
              <div className="detalle-recom">
                <h3 className="detalle-recom__titulo"><IconoSol /> Antes de entrar al agua</h3>
                <p>{recomendaciones}</p>
              </div>
            )}
          </aside>
        </div>

        {esClase && (
          <div className="detalle-notas">
            <p>Tarifas orientativas en pesos argentinos. Las clases individuales se cobran por persona y la grupal, por grupo. Confirmá el valor y el equipo al consultar.</p>
            <p>Los horarios y la realización de la clase se coordinan según disponibilidad y condiciones del mar.</p>
          </div>
        )}
      </div>
    </div>
  );
}