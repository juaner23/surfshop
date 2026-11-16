import { Link } from 'react-router-dom';
import IconoOndas from './IconoOndas.jsx';

const TEXTO_UNIDAD = { hora: 'hora', clase: 'clase', dia: 'día', unidad: 'unidad' };

// useGrouping "always" para que 4500 se vea "4.500" (por defecto, en español no agrupa los de 4 cifras)
const formatoPrecio = new Intl.NumberFormat('es-AR', { useGrouping: 'always' });

export default function TarjetaClase({ clase }) {
  const titulo = clase.nombre;
  const disponible = clase.estado === 'disponible';
  const imagen = clase.imagenes?.[0];
  const unidad = TEXTO_UNIDAD[clase.unidadPrecio];
  const tienePrecio = clase.precio > 0;

  return (
    <article className="clase-card">
      <div className="clase-card__imagen">
        {imagen && (
          <img
            src={imagen}
            alt={`Clase de surf: ${titulo}`}
            loading="lazy"
          />
        )}
        {!disponible && <span className="clase-card__badge">NO DISPONIBLE</span>}
      </div>

      <div className="clase-card__cuerpo">
        <div className="clase-card__cabecera">
          <h2 className="clase-card__nombre">{titulo}</h2>
          <IconoOndas size={26} className="clase-card__icono" />
        </div>

        <p className="clase-card__descripcion">{clase.descripcion}</p>

        <div className="clase-card__precio-bloque">
          <p className="clase-card__precio">
            {tienePrecio ? `$ ${formatoPrecio.format(clase.precio)}` : 'Consultar'}
            {tienePrecio && unidad && <span className="clase-card__unidad">/ {unidad}</span>}
          </p>

          {disponible ? (
            <Link to={`/publicaciones/${clase._id}`} className="clase-btn">
              Conocé la clase <span aria-hidden="true">↗</span>
            </Link>
          ) : (
            <span className="clase-btn clase-btn--deshabilitado" aria-disabled="true">
              No disponible por ahora
            </span>
          )}
        </div>
      </div>
    </article>
  );
}