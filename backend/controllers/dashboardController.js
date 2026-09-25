const Publicacion = require('../models/Publicacion');
const Consulta = require('../models/Consulta');
const Promocion = require('../models/Promocion');
const Categoria = require('../models/Categoria');

// Convierte el resultado de un $group de Mongo, que viene como array
// [{ _id: 'alquiler_tabla', count: 4 }, ...], en un objeto plano { alquiler_tabla: 4, ... }
// (mucho más cómodo de leer y de consumir después desde el frontend)
const arrayAObjeto = (arr) =>
  arr.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

// @desc    Métricas y estadísticas generales para el panel del administrador
// @route   GET /api/dashboard
// @access  Privado/Admin
const getDashboard = async (req, res) => {
  const ahora = new Date();

  // Promise.all: todas las consultas a la base corren en paralelo, no una atrás de la otra.
  const [
    publicacionesTotal,
    publicacionesActivas,
    publicacionesInactivas,
    publicacionesDestacadas,
    publicacionesPorTipo,
    consultasTotal,
    consultasPendientes,
    consultasLeidas,
    consultasRespondidas,
    promocionesVigentes,
    promocionesVencidas,
    categoriasTotal,
    categoriasActivas,
  ] = await Promise.all([
    Publicacion.countDocuments({}),
    Publicacion.countDocuments({ activo: true }),
    Publicacion.countDocuments({ activo: false }),
    Publicacion.countDocuments({ destacado: true }),
    Publicacion.aggregate([{ $group: { _id: '$tipo', count: { $sum: 1 } } }]),
    Consulta.countDocuments({}),
    Consulta.countDocuments({ estado: 'pendiente' }),
    Consulta.countDocuments({ estado: 'leida' }),
    Consulta.countDocuments({ estado: 'respondida' }),
    Promocion.countDocuments({ activo: true, fechaInicio: { $lte: ahora }, fechaFin: { $gte: ahora } }),
    Promocion.countDocuments({ fechaFin: { $lt: ahora } }),
    Categoria.countDocuments({}),
    Categoria.countDocuments({ activo: true }),
  ]);

  res.json({
    publicaciones: {
      total: publicacionesTotal,
      activas: publicacionesActivas,
      inactivas: publicacionesInactivas,
      destacadas: publicacionesDestacadas,
      porTipo: arrayAObjeto(publicacionesPorTipo),
    },
    consultas: {
      total: consultasTotal,
      pendientes: consultasPendientes,
      leidas: consultasLeidas,
      respondidas: consultasRespondidas,
    },
    promociones: {
      vigentes: promocionesVigentes,
      vencidas: promocionesVencidas,
    },
    categorias: {
      total: categoriasTotal,
      activas: categoriasActivas,
    },
  });
};

module.exports = { getDashboard };