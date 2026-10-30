// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

require('./models/Usuario');
require('./models/Categoria');
require('./models/Publicacion');
require('./models/Consulta');
require('./models/ComercioInfo');
require('./models/ResetToken');
require('./models/TokenInvalidado');
require('./models/Promocion');

const categoriaRoutes = require('./routes/categoriaRoutes');
const consultaRoutes = require('./routes/ConsultaRoutes');
const publicacionRoutes = require('./routes/publicacionRoutes');
const authRoutes = require('./routes/authRoutes');
const comercioRoutes = require('./routes/comercioRoutes');
const promocionRoutes = require('./routes/promocionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// 1. Inicializar la app de Express
const app = express();

// 2. Conectar a la base de datos
connectDB();

// 3. Middlewares globales
// CORS: solo se aceptan pedidos desde el frontend (FRONTEND_URL del .env).
// Si querés permitir más de un origen, separalos con coma: http://localhost:5173,https://midominio.com
const origenesPermitidos = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''));

app.use(cors({ origin: origenesPermitidos }));
app.use(express.json()); // Permite al servidor entender datos en formato JSON

// 4. Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor del Surf Shop funcionando' });
});

// 5. Rutas de la API
app.use('/api/categorias', categoriaRoutes);
app.use('/api/consultas', consultaRoutes);
app.use('/api/publicaciones', publicacionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/comercio', comercioRoutes);
app.use('/api/promociones', promocionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);

// 6. Middlewares de error (siempre al final, después de todas las rutas)
app.use(notFound);
app.use(errorHandler);

// 7. Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});