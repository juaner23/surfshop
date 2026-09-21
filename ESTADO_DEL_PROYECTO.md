# Estado del backend — Tienda de Surf (TPO)

Este documento es el traspaso de todo lo que se hizo del backend hasta ahora, y lo que falta,
para que Maga pueda seguir sin tener que reconstruir el contexto desde cero.

## Cómo correr el proyecto

1. `cd backend`
2. `npm install`
3. Pedirle a Juan el archivo `.env` (tiene la contraseña de la base de Atlas y no está en git a
   propósito — nunca subir contraseñas al repositorio). Se copia tal cual dentro de `backend/`.
4. `npm run dev` (usa nodemon, reinicia solo con cada cambio) o `npm start`.
5. Probar que anda: `http://localhost:5000/api/health` tiene que devolver `{"status":"ok", ...}`.

## Cómo está organizado el código

```
backend/
  models/       -> la forma de cada dato en MongoDB (Mongoose)
  controllers/  -> la lógica real: qué hacer con cada pedido
  routes/       -> qué URL + método HTTP dispara qué función del controller
  middleware/   -> funciones que se ejecutan en el medio de cada pedido (manejo de errores)
  config/db.js  -> conexión a MongoDB Atlas
  server.js     -> arma todo junto y levanta el servidor
```

El patrón se repite igual en cada entidad. El ejemplo más simple y ya terminado para copiar es
**Categoría** (`controllers/categoriaController.js` + `routes/categoriaRoutes.js`).

**Regla que veníamos siguiendo, no la pierdas**: ningún endpoint se da por terminado sin probarlo
con Postman o `curl` primero (crear bien, crear mal a propósito, buscar uno que no existe, etc.).
Así encontramos y arreglamos 2 bugs reales antes de que llegaran a la demo (ver "Decisiones y
bugs ya resueltos" más abajo).

## Lo que ya está hecho y probado

- **Categoría**: CRUD completo (`nombre`, `descripcion`, `tipo`: producto/servicio, `activo`).
  No deja borrar una categoría si tiene publicaciones asociadas.
- **Publicación** (productos/servicios — antes se llamaba "Producto", se renombró para hablar el
  mismo idioma que la consigna): CRUD completo, con:
  - Búsqueda por texto: `GET /api/publicaciones?q=surf`
  - Filtro por categoría: `GET /api/publicaciones?categoriaId=...`
  - Filtro por tipo: `GET /api/publicaciones?tipo=clase`
  - El listado público solo muestra `activo: true` (esa es la función de "activar/desactivar").
  - Rechaza crear una publicación con una categoría que no existe.
  - `tipo` puede ser: `alquiler_tabla`, `alquiler_ropa`, `alquiler_equipo`, `clase`, `merch`.
  - `nivel` (`principiante`/`intermedio`/`profesional`) es obligatorio solo si `tipo = "clase"`.
- **Manejo de errores centralizado** (`middleware/errorMiddleware.js`): cualquier error de
  Mongoose (validación, duplicado, id con formato inválido) se traduce a una respuesta JSON
  clara con el código HTTP correcto, en vez de un crash o un 500 genérico.
- **Modelo de datos ajustado al DER** que armamos con vos (ver `der_tienda_surf.png` que le
  pasaste — pedíselo a Juan si no lo tenés): `Usuario` con `rol` y `passwordHash`, `ComercioInfo`
  con `adminId` y `redesSociales` embebido, `Consulta` con `publicacionId` opcional, y los modelos
  nuevos `ResetToken` y `TokenInvalidado` (con índice TTL, para que Mongo los borre solos).

## Lo que falta (en orden recomendado)

1. **Terminar el CRUD de Consultas** — se lo delegamos a vos, fijate en qué quedó en tu rama
   `maga` (`controllers/consultaController.js` + `routes/consultaRoutes.js`, mismo patrón que
   Categoría). Falta sumarle la ruta a `server.js` (`app.use('/api/consultas', consultaRoutes)`)
   si todavía no está.
2. **Usuario — autenticación** (el bloque más grande que falta):
   - Registro (`POST /api/usuarios`): hashear la contraseña con `bcryptjs` antes de guardar
     (nunca guardar texto plano — por eso el campo se llama `passwordHash`).
   - Login (`POST /api/usuarios/login`): comparar el hash, si coincide devolver un JWT
     (`jsonwebtoken`, ya está instalado).
   - Middleware `protect`: lee el JWT del header `Authorization`, lo valida, y solo si es válido
     deja pasar el pedido (si no, 401).
   - Recuperar contraseña: la profesora pidió que sea con **mail real** (no simulado). Hace falta
     `nodemailer` (agregarlo con `npm install nodemailer`) y una cuenta de correo con "contraseña
     de aplicación" (buscar "gmail app password" si es Gmail). Se guarda un `ResetToken` con
     vencimiento corto y se manda por mail un link con ese token.
   - Logout con lista negra: al cerrar sesión, guardar el JWT en `TokenInvalidado`. El middleware
     `protect` tiene que chequear también que el token no esté ahí antes de aceptarlo.
3. **Proteger las rutas de escritura** de Categoría, Publicación y Consultas con el middleware
   `protect` (crear/editar/eliminar solo si hay login; los `GET` siguen públicos).
4. **CRUD de ComercioInfo**: es un caso especial porque solo existe **un** documento en toda la
   colección (el comercio es uno solo). `GET /api/comercio` público, `PUT /api/comercio` protegido
   (si no existe el documento todavía, crearlo la primera vez; si existe, actualizarlo).
5. **Cargar los 20 productos reales** vía Postman (la profesora pidió que entren por la API real,
   no por un script de seed que los inserte directo a la base).
6. **Armar una colección de Postman** con todos los endpoints ya cargados (un pedido de ejemplo
   por cada uno), para no tener que escribirlos a mano el día de la presentación.
7. **Actualizar el Word de documentación** (`Documentacion_TPO_TiendaSurf.docx`) para que el
   modelo de datos que describe coincida con el código final (quedó desactualizado desde que
   corregimos lo de `redesSociales` embebido y sumamos los campos nuevos).

## Cómo mostrar esto en la presentación (según indicó la profesora)

- Mostrar en Postman altas y bajas (`POST`/`DELETE`) de productos, y que se vea la respuesta.
- Después ir a MongoDB Atlas (o Compass) y mostrar que el dato quedó guardado de verdad.
- Sin carrito de compras — el "flujo de compra" de este proyecto es el formulario de contacto
  (`Consulta`), no una compra real.
- Las imágenes de las publicaciones son URLs (no se suben archivos), así que para cargar los 20
  productos hace falta tener 20 URLs de imágenes ya subidas a algún lado (ImgBB, por ejemplo).

## Decisiones y bugs ya resueltos (para no repetirlos)

- El campo `nivel` de Publicación al principio usaba un `validate` custom para "obligatorio solo
  si es clase", pero Mongoose no ejecuta esa función si el campo viene vacío. Se resolvió con
  `required` condicional (una función), que sí se ejecuta siempre. Ver `models/Publicacion.js`.
- El controller de Categoría al principio no leía `tipo`/`activo` del body al crear/editar —
  encontrado probando con `curl`, ya está arreglado.
- `redesSociales` se decidió embeber dentro de `ComercioInfo` (no como colección aparte), porque
  siempre se lee junto con el resto de la info del comercio — la propia documentación del
  proyecto define ese criterio, solo que no se había aplicado bien ahí.
- `horarios` de ComercioInfo quedó como texto libre (no un array por día), para no complicar el
  formulario de admin sin necesidad real.

## Ramas de git

Se viene trabajando así: cada uno en su rama (`juan`, `maga`), y se van mergeando entre ellas para
mantenerse sincronizados (`git merge origin/juan` desde `maga`, por ejemplo) antes de eventualmente
juntar todo en `main`. Seguí usando ese flujo.
