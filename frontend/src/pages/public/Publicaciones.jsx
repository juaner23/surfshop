import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import TarjetaProducto from '../../components/TarjetaProducto.jsx';
import './Publicaciones.css';

const ORDENES = [
  { valor: 'recientes', texto: 'Más recientes' },
  { valor: 'precio_asc', texto: 'Precio: menor a mayor' },
  { valor: 'precio_desc', texto: 'Precio: mayor a menor' },
];

export default function Publicaciones() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const categoria = searchParams.get('categoria') || '';
  const ordenParam = searchParams.get('orden');
  const orden = ORDENES.some((o) => o.valor === ordenParam) ? ordenParam : 'recientes';
  const soloDisponibles = searchParams.get('disponibles') === 'true';

  const [textoBusqueda, setTextoBusqueda] = useState(q);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cargoAlgunaVez, setCargoAlgunaVez] = useState(false);
  const [error, setError] = useState('');
  const numeroPeticion = useRef(0);

  const hayFiltros = Boolean(q || categoria || soloDisponibles || orden !== 'recientes');

  // Actualiza los filtros en la dirección (sin llenar el historial)
  const cambiarParams = useCallback(
    (cambios) => {
      setSearchParams(
        (previos) => {
          const nuevos = new URLSearchParams(previos);
          Object.entries(cambios).forEach(([clave, valor]) => {
            if (!valor || (clave === 'orden' && valor === 'recientes')) nuevos.delete(clave);
            else nuevos.set(clave, valor);
          });
          return nuevos;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  useEffect(() => {
    document.title = 'Productos | Aloha Surf Shop';
  }, []);

  // Búsqueda con espera: no consulta al back en cada tecla
  useEffect(() => {
    const espera = setTimeout(() => {
      const limpio = textoBusqueda.trim();
      if (limpio !== q) cambiarParams({ q: limpio });
    }, 350);
    return () => clearTimeout(espera);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textoBusqueda]);

  // Categorías para los botones de filtro (solo las de productos, no las de servicios/clases)
  useEffect(() => {
    let activo = true;
    api
      .get('/categorias')
      .then((data) => activo && setCategorias(data.filter((c) => c.tipo === 'producto')))
      .catch(() => {});
    return () => {
      activo = false;
    };
  }, []);

  const cargar = useCallback(async () => {
    const actual = ++numeroPeticion.current;
    setCargando(true);
    setError('');

    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (categoria) params.set('categoriaId', categoria);
    if (soloDisponibles) params.set('disponible', 'true');
    if (orden !== 'recientes') params.set('orden', orden);
    const consulta = params.toString();

    try {
      const data = await api.get(`/publicaciones${consulta ? `?${consulta}` : ''}`);
      if (actual !== numeroPeticion.current) return; // llegó una respuesta vieja
      // Las clases tienen su propia pantalla
      setProductos(data.filter((p) => p.tipo !== 'clase'));
      setCargoAlgunaVez(true);
    } catch (e) {
      if (actual !== numeroPeticion.current) return;
      setError(e.message);
    } finally {
      if (actual === numeroPeticion.current) setCargando(false);
    }
  }, [q, categoria, orden, soloDisponibles]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const limpiarFiltros = () => {
    setTextoBusqueda('');
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="prod-page">
      <div className="prod-inner">
        <header>
          <p className="prod-eyebrow">EQUIPO Y MÁS</p>
          <h1 className="prod-titulo">Todo para entrar al agua.</h1>
          <p className="prod-intro">
            Tablas, neoprenes, accesorios y merch. Alquilá lo que necesitás para tu sesión o llevate
            un recuerdo del shop.
          </p>
        </header>

        {/* ---------- Búsqueda y filtros ---------- */}
        <div className="prod-toolbar">
          <div className="prod-buscador">
            <label htmlFor="busqueda" className="prod-sr">
              Buscar productos
            </label>
            <input
              id="busqueda"
              type="search"
              placeholder="Buscá por nombre o descripción"
              value={textoBusqueda}
              onChange={(e) => setTextoBusqueda(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="prod-controles">
            <label className="prod-orden">
              <span className="prod-sr">Ordenar por</span>
              <select value={orden} onChange={(e) => cambiarParams({ orden: e.target.value })}>
                {ORDENES.map((o) => (
                  <option key={o.valor} value={o.valor}>
                    {o.texto}
                  </option>
                ))}
              </select>
            </label>

            <label className="prod-check">
              <input
                type="checkbox"
                checked={soloDisponibles}
                onChange={(e) => cambiarParams({ disponibles: e.target.checked ? 'true' : '' })}
              />
              Solo disponibles
            </label>
          </div>
        </div>

        {categorias.length > 0 && (
          <div className="prod-chips" role="group" aria-label="Filtrar por categoría">
            <button
              type="button"
              className={`prod-chip${!categoria ? ' prod-chip--activo' : ''}`}
              aria-pressed={!categoria}
              onClick={() => cambiarParams({ categoria: '' })}
            >
              Todos
            </button>
            {categorias.map((c) => (
              <button
                key={c._id}
                type="button"
                className={`prod-chip${categoria === c._id ? ' prod-chip--activo' : ''}`}
                aria-pressed={categoria === c._id}
                onClick={() => cambiarParams({ categoria: c._id })}
              >
                {c.nombre}
              </button>
            ))}
          </div>
        )}

        {/* ---------- Resultados ---------- */}
        {cargoAlgunaVez && !error && (
          <p className="prod-cantidad" aria-live="polite">
            {productos.length} {productos.length === 1 ? 'producto' : 'productos'}
          </p>
        )}

        {!cargoAlgunaVez && cargando && (
          <div className="prod-grid" aria-busy="true" aria-label="Cargando productos">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="prod-skeleton" />
            ))}
          </div>
        )}

        {error && (
          <div className="prod-estado" role="alert">
            <p>{error}</p>
            <button type="button" className="prod-estado__accion" onClick={cargar}>
              Reintentar
            </button>
          </div>
        )}

        {!error && cargoAlgunaVez && productos.length === 0 && (
          <div className="prod-estado">
            <p>
              {hayFiltros
                ? 'No encontramos productos con esos filtros.'
                : 'Por ahora no hay productos publicados.'}
            </p>
            {hayFiltros && (
              <button type="button" className="prod-estado__accion" onClick={limpiarFiltros}>
                Limpiar filtros
              </button>
            )}
          </div>
        )}

        {!error && productos.length > 0 && (
          <div className={`prod-grid${cargando ? ' prod-grid--cargando' : ''}`}>
            {productos.map((p) => (
              <TarjetaProducto key={p._id} producto={p} />
            ))}
          </div>
        )}

        <p className="prod-nota">
          Precios en pesos argentinos. Los alquileres se cobran por día. Confirmá disponibilidad y
          equipo al consultar.
        </p>
      </div>
    </div>
  );
}