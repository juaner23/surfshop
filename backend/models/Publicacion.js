const mongoose = require('mongoose');

const TIPOS_PUBLICACION = ['alquiler_tabla', 'alquiler_ropa', 'alquiler_equipo', 'clase', 'merch'];
const NIVELES = ['principiante', 'intermedio', 'profesional'];
const UNIDADES_PRECIO = ['dia', 'clase', 'unidad'];
const ESTADOS = ['disponible', 'no_disponible'];

const publicacionSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  categoriaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Categoria',
    required: true
  },
  descripcion: { type: String, required: true },
  tipo: { type: String, enum: TIPOS_PUBLICACION, required: true },
  nivel: {
    type: String,
    enum: NIVELES,
    // required condicional: Mongoose sí ejecuta esta función aunque el campo venga vacío
    // (a diferencia de "validate", que Mongoose ni siquiera llama si el valor es undefined).
    required: [
      function () { return this.tipo === 'clase'; },
      'nivel es obligatorio cuando tipo = "clase"'
    ]
  },
  precio: { type: Number, default: 0 },
  unidadPrecio: { type: String, enum: UNIDADES_PRECIO, default: 'unidad' },
  imagenes: {
    type: [{ type: String, required: true }],
    validate: {
      validator: (arr) => arr.length > 0,
      message: 'La publicación necesita al menos una imagen'
    }
  },
  estado: { type: String, enum: ESTADOS, default: 'disponible' },
  destacado: { type: Boolean, default: false },
  activo: { type: Boolean, default: true } // visible/oculta en el sitio (distinto de "estado")
}, {
  timestamps: true
});

module.exports = mongoose.model('Publicacion', publicacionSchema);
