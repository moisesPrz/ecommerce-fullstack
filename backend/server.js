/**
 * ARCHIVO: backend/server.js
 * 
 * PROPÓSITO: Entry point del servidor. Configura Express con todos
 * los middlewares de seguridad, logging y rutas.
 * 
 * ORDEN DE MIDDLEWARES (el orden importa en Express):
 * 1. Variables de entorno (primero, antes de todo)
 * 2. Seguridad HTTP (Helmet, CORS)
 * 3. Rate limiting
 * 4. Parseo de body
 * 5. Logging de peticiones
 * 6. Rutas
 * 7. Manejo de errores (siempre al final)
 */

// ── 1. CARGAR Y VALIDAR VARIABLES DE ENTORNO ─────────────
require('dotenv').config();
const { validarEnv } = require('./config/env');
validarEnv(); // Si falta algo, el servidor no arranca

// ── 2. IMPORTACIONES ──────────────────────────────────────
const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const path       = require('path');
const rateLimit  = require('express-rate-limit');

const logger        = require('./config/logger');
const requestLogger = require('./middleware/requestLogger');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { connectDB, sequelize }   = require('./config/database');

// ── 3. IMPORTAR MODELOS (define las tablas y relaciones) ──
const Usuario     = require('./models/Usuario');
const Producto    = require('./models/Producto');
const Pedido      = require('./models/Pedido');
const DetallePedido = require('./models/DetallePedido');

// Relaciones
Usuario.hasMany(Pedido);
Pedido.belongsTo(Usuario);
Pedido.belongsToMany(Producto, { through: DetallePedido });
Producto.belongsToMany(Pedido, { through: DetallePedido });

// ── 4. IMPORTAR RUTAS ─────────────────────────────────────
const authRoutes     = require(path.join(__dirname, 'routes', 'authRoutes'));
const testRoutes     = require(path.join(__dirname, 'routes', 'testRoutes'));
const productoRoutes = require(path.join(__dirname, 'routes', 'productoRoutes'));
const paymentRoutes  = require(path.join(__dirname, 'routes', 'paymentRoutes'));
const pedidoRoutes   = require(path.join(__dirname, 'routes', 'pedidoRoutes'));
const vendedorRoutes = require(path.join(__dirname, 'routes', 'vendedorRoutes'));
const adminRoutes    = require(path.join(__dirname, 'routes', 'adminRoutes'));

// ── 5. CONFIGURAR EXPRESS ─────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 3001;

// ── 6. MIDDLEWARES DE SEGURIDAD HTTP ─────────────────────

/**
 * Helmet: Agrega headers HTTP de seguridad automáticamente.
 * Protege contra clickjacking, MIME sniffing, XSS en browsers, etc.
 */
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // Permite cargar imágenes de Cloudinary
}));

/**
 * CORS: Solo permite peticiones desde el frontend autorizado.
 * En producción, cambiar FRONTEND_URL por el dominio real.
 */
const origenesPermitidos = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origen (Postman, mobile apps)
    if (!origin || origenesPermitidos.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn(`CORS bloqueado: origen no permitido: ${origin}`);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── 7. RATE LIMITING ──────────────────────────────────────

/**
 * Rate limit general: 100 peticiones cada 15 minutos por IP.
 * Protege contra ataques de fuerza bruta y scraping.
 */
const limitGeneral = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiadas peticiones. Intenta de nuevo en 15 minutos.',
  },
  handler: (req, res, next, options) => {
    logger.warn('Rate limit alcanzado', { ip: req.ip, url: req.originalUrl });
    res.status(options.statusCode).json(options.message);
  },
});

/**
 * Rate limit estricto para autenticación: 10 intentos cada 15 minutos.
 * Previene ataques de fuerza bruta en login/registro.
 */
const limitAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Demasiados intentos de autenticación. Espera 15 minutos.',
  },
  handler: (req, res, next, options) => {
    logger.warn('Rate limit de auth alcanzado', { ip: req.ip });
    res.status(options.statusCode).json(options.message);
  },
});

app.use('/api', limitGeneral);
app.use('/api/auth/login', limitAuth);
app.use('/api/auth/register', limitAuth);

// ── 8. PARSEO DE BODY ─────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── 9. LOGGING DE PETICIONES ─────────────────────────────
app.use(requestLogger);

// ── 10. RUTA DE SALUD (Health Check) ─────────────────────
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 TechMarket API funcionando',
    version: '1.0.0',
    ambiente: process.env.NODE_ENV,
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    ambiente: process.env.NODE_ENV,
  });
});

// ── 11. RUTAS DE LA API ───────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/test',      testRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/pedidos',   pedidoRoutes);
app.use('/api/pagos',     paymentRoutes);
app.use('/api/vendedor',  vendedorRoutes);
app.use('/api/admin',     adminRoutes);

// ── 12. MANEJO DE ERRORES (siempre al final) ──────────────
app.use(notFound);     // Rutas no encontradas → 404
app.use(errorHandler); // Errores no manejados → 500

// ── 13. INICIAR SERVIDOR ──────────────────────────────────
const iniciarServidor = async () => {
  try {
    // Conectar base de datos
    await connectDB();

    // Sincronizar modelos
    await sequelize.sync({ alter: true });
    logger.info('✅ Modelos sincronizados con MySQL');

    // Iniciar servidor HTTP
    app.listen(PORT, () => {
      logger.info(`🚀 TechMarket API iniciada`, {
        puerto: PORT,
        ambiente: process.env.NODE_ENV,
        url: `http://localhost:${PORT}`,
      });
    });

  } catch (error) {
    logger.logError('iniciarServidor', error);
    process.exit(1);
  }
};

// ── 14. MANEJO DE ERRORES NO CAPTURADOS ──────────────────

// Promesas rechazadas sin catch
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesa rechazada sin manejar', {
    reason: reason?.message || reason,
    promise,
  });
});

// Excepciones síncronas no capturadas
process.on('uncaughtException', (error) => {
  logger.logError('uncaughtException', error);
  // Dar tiempo al logger de escribir antes de salir
  setTimeout(() => process.exit(1), 1000);
});

iniciarServidor();
