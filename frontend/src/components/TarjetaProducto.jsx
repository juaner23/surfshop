import { Link } from 'react-router-dom';
import { TEXTO_UNIDAD, formatearPrecio } from '../utils/formato.js';

export default function TarjetaProducto({ producto }) {
  const disponible = producto.estado === 'disponible';
  const imagen = producto.imagenes?.[0];
  const tienePrecio = producto.precio > 0;
  // "unidad" no se muestra: $ 6.000 / unidad suena raro; para los alquileres sí ("/ día")
  const unidad =
    producto.unidadPrecio && producto.unidadPrecio !== 'unidad'
      ? TEXTO_UNIDAD[producto.unidadPrecio]
      : null;
  const esAlquiler = producto.tipo?.startsWith('alquiler');

  return (
    <article className={`producto-card${disponible ? '' : ' producto-card--agotado'}`}>
      <Link to={`/publicaciones/${producto._id}`} className="producto-card__enlace">
        <div className="producto-card__imagen">
          {imagen && (
            <img
              src={imagen}
              alt={producto.nombre}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.visibility = 'hidden';
              }}
            />
          )}
          {!disponible && <span className="producto-card__badge">NO DISPONIBLE</span>}
        </div>

        <div className="producto-card__info">
          <p className="producto-card__categoria">
            {producto.categoriaId?.nombre}
            {esAlquiler && ' · Alquiler'}
          </p>
          <h2 className="producto-card__nombre">{producto.nombre}</h2>
          <p className="producto-card__desc">{producto.descripcion}</p>
          <p className="producto-card__precio">
            {tienePrecio ? formatearPrecio(producto.precio) : 'Consultar'}
            {tienePrecio && unidad && <span className="producto-card__unidad">/ {unidad}</span>}
          </p>
        </div>
      </Link>
    </article>
  );
}