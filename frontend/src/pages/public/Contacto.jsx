import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import CampoFormulario from '../../components/CampoFormulario.jsx';
import GrupoRadio from '../../components/GrupoRadio.jsx';
import { validarConsulta } from '../../utils/validaciones.js';
import './Contacto.css';

const VALORES_INICIALES = { nombre: '', email: '', telefono: '', disponibilidad: '', mensaje: '' };
const ORDEN_CAMPOS = ['nombre', 'email', 'telefono', 'disponibilidad', 'interes', 'mensaje'];
const ORDEN_NIVELES = ['principiante', 'intermedio', 'profesional'];
const esGrupal = (clase) => /grupal/i.test(clase.nombre);

const REDES = [
  { clave: 'instagram', nombre: 'Instagram', base: 'https://instagram.com/' },
  { clave: 'facebook', nombre: 'Facebook', base: 'https://facebook.com/' },
  { clave: 'tiktok', nombre: 'TikTok', base: 'https://tiktok.com/@' },
  { clave: 'whatsapp', nombre: 'WhatsApp', base: 'https://wa.me/' },
];

// Acepta tanto una URL completa como un usuario / número suelto
function urlRed(clave, base, valor) {
  const v = valor.trim();
  if (/^https?:\/\//i.test(v)) return v;
  const limpio = clave === 'whatsapp' ? v.replace(/\D/g, '') : v.replace(/^@/, '');
  return `${base}${limpio}`;
}

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

const IconoCandado = () => (
  <svg width="16" height="16" {...propsIcono}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

export default function Contacto() {
  const [searchParams] = useSearchParams();
  const idPublicacion = searchParams.get('publicacion');

  const [valores, setValores] = useState(VALORES_INICIALES);
  const [interes, setInteres] = useState('');
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState('');
  const [enviado, setEnviado] = useState(false);

  const [clases, setClases] = useState([]);
  const [cargandoClases, setCargandoClases] = useState(true);
  const [publicacionParam, setPublicacionParam] = useState(null);
  const [descartada, setDescartada] = useState(false);
  const [comercio, setComercio] = useState(null);

  // Si venimos desde un producto (no una clase), la consulta queda asociada a ese producto
  const productoConsultado =
    publicacionParam && publicacionParam.tipo !== 'clase' && !descartada ? publicacionParam : null;

  const validar = (v, i) =>
    validarConsulta({ ...v, interes: i }, { requiereInteres: !productoConsultado });

  useEffect(() => {
    document.title = 'Contacto | Aloha Surf Shop';
  }, []);

  // Datos del comercio (para la franja inferior)
  useEffect(() => {
    let activo = true;
    api
      .get('/comercio')
      .then((datos) => activo && setComercio(datos))
      .catch(() => {});
    return () => {
      activo = false;
    };
  }, []);

  // Clases disponibles para elegir
  useEffect(() => {
    let activo = true;
    api
      .get('/publicaciones?tipo=clase')
      .then((data) => {
        if (!activo) return;
        const ordenadas = [...data].sort((a, b) => {
          if (esGrupal(a) !== esGrupal(b)) return esGrupal(a) ? 1 : -1;
          return ORDEN_NIVELES.indexOf(a.nivel) - ORDEN_NIVELES.indexOf(b.nivel);
        });
        setClases(ordenadas);
      })
      .catch(() => {
        // sin clases: queda solo la opción "Otra consulta"
      })
      .finally(() => activo && setCargandoClases(false));
    return () => {
      activo = false;
    };
  }, []);

  // Publicación indicada en la dirección (?publicacion=ID)
  useEffect(() => {
    if (!idPublicacion) return;
    let activo = true;
    api
      .get(`/publicaciones/${idPublicacion}`)
      .then((p) => activo && setPublicacionParam(p))
      .catch(() => {
        // id inválido o inexistente: se ignora
      });
    return () => {
      activo = false;
    };
  }, [idPublicacion]);

  // Si venimos desde una clase, queda preseleccionada
  useEffect(() => {
    if (!publicacionParam || publicacionParam.tipo !== 'clase') return;
    if (clases.some((c) => c._id === publicacionParam._id)) {
      setInteres((previo) => previo || publicacionParam._id);
    }
  }, [publicacionParam, clases]);

  const opciones = [
    ...clases.map((c) => ({ valor: c._id, etiqueta: c.nombre })),
    { valor: 'otra', etiqueta: 'Otra consulta' },
  ];

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    const nuevos = { ...valores, [name]: value };
    setValores(nuevos);
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: validar(nuevos, interes)[name] }));
    }
  };

  const manejarBlur = (e) => {
    const { name } = e.target;
    setErrores((prev) => ({ ...prev, [name]: validar(valores, interes)[name] }));
  };

  const elegirInteres = (valor) => {
    setInteres(valor);
    setErrores((prev) => ({ ...prev, interes: undefined }));
  };

  const enviar = async (e) => {
    e.preventDefault();
    const erroresNuevos = validar(valores, interes);
    setErrores(erroresNuevos);

    if (Object.keys(erroresNuevos).length > 0) {
      const primero = ORDEN_CAMPOS.find((campo) => erroresNuevos[campo]);
      const elemento =
        primero === 'interes'
          ? document.querySelector('input[name="interes"]')
          : document.getElementById(primero);
      elemento?.focus();
      return;
    }

    // El asunto y la publicación asociada se arman según lo que eligió la persona
    let publicacionId;
    let asunto = 'Consulta general';
    if (productoConsultado) {
      publicacionId = productoConsultado._id;
      asunto = `Consulta sobre ${productoConsultado.nombre}`;
    } else if (interes && interes !== 'otra') {
      const clase = clases.find((c) => c._id === interes);
      publicacionId = clase?._id;
      asunto = `Consulta sobre ${clase?.nombre ?? 'una clase'}`;
    }

    setEnviando(true);
    setErrorEnvio('');
    try {
      const telefono = valores.telefono.trim();
      await api.post('/consultas', {
        ...(publicacionId && { publicacionId }),
        nombre: valores.nombre.trim(),
        email: valores.email.trim(),
        ...(telefono && { telefono }),
        disponibilidad: valores.disponibilidad.trim(),
        asunto: asunto.slice(0, 100),
        mensaje: valores.mensaje.trim(),
      });
      setEnviado(true);
    } catch (err) {
      setErrorEnvio(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const enviarOtra = () => {
    setValores(VALORES_INICIALES);
    setInteres('');
    setErrores({});
    setErrorEnvio('');
    setDescartada(true);
    setEnviado(false);
  };

  const redes = comercio ? REDES.filter((r) => comercio.redesSociales?.[r.clave]?.trim()) : [];
  const volver = productoConsultado
    ? { to: '/publicaciones', texto: 'Todos los productos' }
    : { to: '/clases', texto: 'Todas las clases' };

  return (
    <div className="contacto-page">
      <div className="contacto-inner">
        <Link to={volver.to} className="contacto-volver">
          <IconoVolver /> {volver.texto}
        </Link>

        <header className="contacto-header">
          <p className="contacto-eyebrow">NOS VEMOS EN EL AGUA</p>
          <h1 className="contacto-titulo">Contactanos</h1>
          <p className="contacto-intro">
            ¿Primera vez o una nueva meta? Contanos un poco de vos y empecemos a pensar tu próxima
            sesión.
          </p>
        </header>

        <section className="contacto-card" aria-label="Formulario de consulta">
          {enviado ? (
            <div className="contacto-exito" role="status">
              <h2 className="contacto-exito__titulo">¡Gracias por escribirnos!</h2>
              <p>
                Recibimos tu consulta y te vamos a responder a{' '}
                <strong>{valores.email.trim()}</strong>.
              </p>
              <div className="contacto-exito__acciones">
                <button type="button" className="contacto-btn" onClick={enviarOtra}>
                  Enviar otra consulta
                </button>
                <Link to="/clases" className="contacto-btn contacto-btn--borde">
                  Ver las clases
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h2 className="contacto-card__titulo">Hablemos de tu próxima ola</h2>
              <p className="contacto-card__sub">
                Dejanos tus datos y tu disponibilidad para conversar sobre la clase. Los campos con *
                son obligatorios.
              </p>

              <form onSubmit={enviar} noValidate className="contacto-form">
                <div className="contacto-fila">
                  <CampoFormulario
                    id="nombre"
                    label="Nombre y apellido *"
                    placeholder="Tu nombre y apellido"
                    valor={valores.nombre}
                    onChange={manejarCambio}
                    onBlur={manejarBlur}
                    error={errores.nombre}
                    maxLength={100}
                    autoComplete="name"
                    aria-required="true"
                  />
                  <CampoFormulario
                    id="email"
                    label="Email *"
                    tipo="email"
                    placeholder="vos@ejemplo.com"
                    valor={valores.email}
                    onChange={manejarCambio}
                    onBlur={manejarBlur}
                    error={errores.email}
                    maxLength={100}
                    autoComplete="email"
                    aria-required="true"
                  />
                </div>

                <div className="contacto-fila">
                  <CampoFormulario
                    id="telefono"
                    label="Teléfono"
                    opcional
                    tipo="tel"
                    placeholder="Código de área y número"
                    valor={valores.telefono}
                    onChange={manejarCambio}
                    onBlur={manejarBlur}
                    error={errores.telefono}
                    maxLength={20}
                    autoComplete="tel"
                  />
                  <CampoFormulario
                    id="disponibilidad"
                    label="Disponibilidad *"
                    placeholder="Ej.: sábados por la mañana"
                    valor={valores.disponibilidad}
                    onChange={manejarCambio}
                    onBlur={manejarBlur}
                    error={errores.disponibilidad}
                    maxLength={100}
                    aria-required="true"
                  />
                </div>

                {productoConsultado ? (
                  <div className="contacto-chip">
                    <span>
                      Consulta sobre: <strong>{productoConsultado.nombre}</strong>
                    </span>
                    <button type="button" onClick={() => setDescartada(true)}>
                      Quitar
                    </button>
                  </div>
                ) : cargandoClases ? (
                  <div className="contacto-radios-skeleton" aria-busy="true" aria-label="Cargando clases">
                    <span /><span /><span />
                  </div>
                ) : (
                  <GrupoRadio
                    nombre="interes"
                    legend="Clase que te interesa *"
                    opciones={opciones}
                    valor={interes}
                    onChange={elegirInteres}
                    error={errores.interes}
                  />
                )}

                <CampoFormulario
                  id="mensaje"
                  label="Mensaje *"
                  multilinea
                  placeholder="Contanos si ya surfeaste, qué te gustaría aprender y si necesitás equipo."
                  valor={valores.mensaje}
                  onChange={manejarCambio}
                  onBlur={manejarBlur}
                  error={errores.mensaje}
                  maxLength={1000}
                  ayuda={`${valores.mensaje.length}/1000`}
                  aria-required="true"
                />

                {errorEnvio && (
                  <p className="contacto-error-envio" role="alert">
                    {errorEnvio}
                  </p>
                )}

                <button type="submit" className="contacto-btn" disabled={enviando}>
                  {enviando ? 'Enviando…' : 'Enviar consulta'} <span aria-hidden="true">↗</span>
                </button>

                <p className="contacto-nota">
                  <IconoCandado />
                  Usaremos tus datos para responder esta consulta. No se confirma una reserva ni se
                  realiza ningún pago.
                </p>
              </form>
            </>
          )}
        </section>

        {comercio && (
          <section className="contacto-info" aria-label="Datos de contacto">
            <div>
              <p className="contacto-info__etiqueta">DIRECCIÓN</p>
              <p className="contacto-info__valor">{comercio.direccion}</p>
            </div>
            <div>
              <p className="contacto-info__etiqueta">TELÉFONO</p>
              <p className="contacto-info__valor">
                <a href={`tel:${comercio.telefono.replace(/[^\d+]/g, '')}`}>{comercio.telefono}</a>
              </p>
            </div>
            <div>
              <p className="contacto-info__etiqueta">EMAIL</p>
              <p className="contacto-info__valor">
                <a href={`mailto:${comercio.email}`}>{comercio.email}</a>
              </p>
            </div>
            <div>
              <p className="contacto-info__etiqueta">HORARIOS</p>
              <p className="contacto-info__valor">{comercio.horarios}</p>
            </div>
            {redes.length > 0 && (
              <div>
                <p className="contacto-info__etiqueta">SEGUÍ LA OLA</p>
                <p className="contacto-info__valor contacto-info__redes">
                  {redes.map((r) => (
                    <a
                      key={r.clave}
                      href={urlRed(r.clave, r.base, comercio.redesSociales[r.clave])}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {r.nombre} ↗
                    </a>
                  ))}
                </p>
              </div>
            )}
          </section>
        )}

        <p className="contacto-pie">
          Los horarios y la realización de la clase se coordinan según disponibilidad y condiciones
          del mar.
        </p>
      </div>
    </div>
  );
}