const ComercioInfo = require('../models/ComercioInfo');

// Solo estos campos se pueden crear/modificar desde la API
// (así nadie toca adminId ni cualquier otro campo que se agregue después al modelo)
const CAMPOS_PERMITIDOS = [
  'nombre', 'descripcion', 'direccion', 'telefono', 'email', 'horarios', 'redesSociales'
];

// Campos obligatorios en el modelo (aparte de adminId, que lo ponemos nosotros)
const CAMPOS_OBLIGATORIOS = ['descripcion', 'direccion', 'telefono', 'email', 'horarios'];

// @desc    Ver la información pública del comercio
// @route   GET /api/comercio
// @access  Público
const getComercio = async (req, res) => {
  // Solo existe un documento de comercio en toda la colección
  const info = await ComercioInfo.findOne();

  if (!info) {
    res.status(404);
    throw new Error('Todavía no se cargó la información del comercio');
  }

  res.json(info);
};

// @desc    Crear (la primera vez) o actualizar la información del comercio
// @route   PUT /api/comercio
// @access  Privado/Admin
const actualizarComercio = async (req, res) => {
  const cambios = {};
  CAMPOS_PERMITIDOS.forEach((campo) => {
    if (req.body[campo] !== undefined) cambios[campo] = req.body[campo];
  });

  let info = await ComercioInfo.findOne();

  if (!info) {
    // Primera vez: no existe el documento todavía.
    // Exigimos que vengan todos los campos obligatorios del modelo.
    const faltantes = CAMPOS_OBLIGATORIOS.filter((campo) => cambios[campo] === undefined);
    if (faltantes.length > 0) {
      res.status(400);
      throw new Error(`Para crear la info del comercio faltan los campos: ${faltantes.join(', ')}`);
    }

    info = await ComercioInfo.create({
      adminId: req.usuario._id,
      ...cambios,
    });

    return res.status(201).json(info);
  }

  // Ya existe: actualización parcial (solo se tocan los campos que vinieron)
  if (cambios.redesSociales) {
    // Merge en vez de reemplazo, para no borrar redes que no se mandaron en este PUT
    const actuales = info.redesSociales?.toObject ? info.redesSociales.toObject() : (info.redesSociales || {});
    cambios.redesSociales = { ...actuales, ...cambios.redesSociales };
  }

  Object.assign(info, cambios);
  const infoActualizada = await info.save();

  res.json(infoActualizada);
};

module.exports = { getComercio, actualizarComercio };