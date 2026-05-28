// ── 1. CARGAR Y VALIDAR VARIABLES DE ENTORNO ─────────────────
require('dotenv').config();
const { validarEnv } = require('./config/env');
validarEnv();

// ── 2. IMPORTACIONES ──────────────────────────────────────────
const express    = require('express');
const helmet     = require('helmet');
const cors       = require('cors');
const path       = require('path');
const rateLimit  = require('express-rate-limit');

const logger        = require('./config/logger');
const requestLogger = require('./middleware/requestLogger');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { connectDB, sequelize }   = require('./config/database');

// ── 3. IMPORTAR MODELOS ───────────────────────────────────────
const Usuario      = require('./models/Usuario');
const Vendedor     = require('./models/Vendedor');
const Categoria    = require('./models/Categoria');
const Producto     = require('./models/Producto');
const Pedido       = require('./models/Pedido');
const DetallePedido = require('./models/DetallePedido');
const Resena       = require('./models/Resena');
const Direccion    = require('./models/Direccion');
const Carrito      = require('./models/Carrito');
const Transaccion  = require('./models/Transaccion');

// ── 4. RELACIONES ─────────────────────────────────────────────

// Usuarios ↔ Vendedores (1:1)
Usuario.hasOne(Vendedor, { foreignKey: 'id_usuario' });
Vendedor.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// Vendedores ↔ Productos
Vendedor.hasMany(Producto, { foreignKey: 'id_vendedor' });
Producto.belongsTo(Vendedor, { foreignKey: 'id_vendedor' });

// Categorias ↔ Productos
Categoria.hasMany(Producto, { foreignKey: 'id_categoria' });
Producto.belongsTo(Categoria, { foreignKey: 'id_categoria' });

// Usuarios ↔ Pedidos
Usuario.hasMany(Pedido, { foreignKey: 'id_usuario' });
Pedido.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// Pedidos ↔ Productos (many-to-many a través de DetallePedido)
Pedido.belongsToMany(Producto, { through: DetallePedido, foreignKey: 'id_pedido', otherKey: 'id_producto' });
Producto.belongsToMany(Pedido, { through: DetallePedido, foreignKey: 'id_producto', otherKey: 'id_pedido' });

// DetallePedido relaciones directas (para queries sin many-to-many)
Pedido.hasMany(DetallePedido, { foreignKey: 'id_pedido' });
DetallePedido.belongsTo(Pedido, { foreignKey: 'id_pedido' });
DetallePedido.belongsTo(Producto, { foreignKey: 'id_producto' });
Producto.hasMany(DetallePedido, { foreignKey: 'id_producto' });

// Reseñas
Usuario.hasMany(Resena, { foreignKey: 'id_usuario' });
Resena.belongsTo(Usuario, { foreignKey: 'id_usuario' });
Producto.hasMany(Resena, { foreignKey: 'id_producto' });
Resena.belongsTo(Producto, { foreignKey: 'id_producto' });

// Direcciones
Usuario.hasMany(Direccion, { foreignKey: 'id_usuario' });
Direccion.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// Carrito
Usuario.hasMany(Carrito, { foreignKey: 'id_usuario' });
Carrito.belongsTo(Usuario, { foreignKey: 'id_usuario' });
Producto.hasMany(Carrito, { foreignKey: 'id_producto' });
Carrito.belongsTo(Producto, { foreignKey: 'id_producto' });

// Transacciones
Pedido.hasMany(Transaccion, { foreignKey: 'id_pedido' });
Transaccion.belongsTo(Pedido, { foreignKey: 'id_pedido' });
Usuario.hasMany(Transaccion, { foreignKey: 'id_usuario' });
Transaccion.belongsTo(Usuario, { foreignKey: 'id_usuario' });

// ── 5. IMPORTAR RUTAS ─────────────────────────────────────────
const authRoutes     = require(path.join(__dirname, 'routes', 'authRoutes'));
const testRoutes     = require(path.join(__dirname, 'routes', 'testRoutes'));
const productoRoutes = require(path.join(__dirname, 'routes', 'productoRoutes'));
const paymentRoutes  = require(path.join(__dirname, 'routes', 'paymentRoutes'));
const pedidoRoutes   = require(path.join(__dirname, 'routes', 'pedidoRoutes'));
const vendedorRoutes  = require(path.join(__dirname, 'routes', 'vendedorRoutes'));
const adminRoutes     = require(path.join(__dirname, 'routes', 'adminRoutes'));
const categoriaRoutes  = require(path.join(__dirname, 'routes', 'categoriaRoutes'));
const resenaRoutes     = require(path.join(__dirname, 'routes', 'resenaRoutes'));
const direccionRoutes  = require(path.join(__dirname, 'routes', 'direccionRoutes'));

// ── 6. CONFIGURAR EXPRESS ─────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 3001;

// ── 7. MIDDLEWARES DE SEGURIDAD HTTP ──────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const origenesPermitidos = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  ...(process.env.CORS_EXTRA_ORIGINS
    ? process.env.CORS_EXTRA_ORIGINS.split(',').map(s => s.trim())
    : ['http://localhost:5174']),
];

app.use(cors({
  origin: (origin, callback) => {
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

// ── 8. RATE LIMITING ──────────────────────────────────────────
const limitGeneral = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiadas peticiones. Intenta de nuevo en 15 minutos.' },
  handler: (req, res, _next, options) => {
    logger.warn('Rate limit alcanzado', { ip: req.ip, url: req.originalUrl });
    res.status(options.statusCode).json(options.message);
  },
});

const limitAuth = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Demasiados intentos de autenticación. Espera 15 minutos.' },
  handler: (req, res, _next, options) => {
    logger.warn('Rate limit de auth alcanzado', { ip: req.ip });
    res.status(options.statusCode).json(options.message);
  },
});

const limitForgotPassword = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Demasiados intentos de recuperación. Espera 1 hora antes de volver a intentarlo.' },
  handler: (req, res, _next, options) => {
    logger.warn('Rate limit forgot-password alcanzado', { ip: req.ip });
    res.status(options.statusCode).json(options.message);
  },
});

app.use('/api', limitGeneral);
app.use('/api/auth/login', limitAuth);
app.use('/api/auth/register', limitAuth);
app.use('/api/auth/forgot-password', limitForgotPassword);
app.use('/api/auth/reset-password', limitForgotPassword);

// ── 9. PARSEO DE BODY ─────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── 10. LOGGING DE PETICIONES ─────────────────────────────────
app.use(requestLogger);

// ── 11. HEALTH CHECK ──────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ success: true, message: '🚀 TechMarket API funcionando', version: '1.0.0', ambiente: process.env.NODE_ENV });
});

app.get('/api/health', (_req, res) => {
  res.json({ success: true, timestamp: new Date().toISOString(), uptime: `${Math.floor(process.uptime())}s`, ambiente: process.env.NODE_ENV });
});

// ── 12. RUTAS DE LA API ───────────────────────────────────────
app.use('/api/auth',      authRoutes);
if (process.env.NODE_ENV !== 'production') app.use('/api/test', testRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/pedidos',   pedidoRoutes);
app.use('/api/pagos',     paymentRoutes);
app.use('/api/vendedor',    vendedorRoutes);
app.use('/api/admin',       adminRoutes);
app.use('/api/categorias',  categoriaRoutes);
app.use('/api/resenas',     resenaRoutes);
app.use('/api/direcciones', direccionRoutes);

// ── 13. MANEJO DE ERRORES ─────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── 14. INICIAR SERVIDOR ──────────────────────────────────────
const iniciarServidor = async () => {
  try {
    await connectDB();

    // Migraciones SQL idempotentes — cada sentencia está envuelta en try/catch
    // para no abortar si el cambio ya fue aplicado (columna existe, índice existe, etc.)
    const migraciones = [
      // ── vendedores: crear tabla y poblar desde usuarios existentes ──────
      `CREATE TABLE IF NOT EXISTS vendedores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        id_usuario INT NOT NULL,
        nombre_tienda VARCHAR(150) NOT NULL,
        slug VARCHAR(170) UNIQUE NOT NULL,
        descripcion TEXT,
        logo_url VARCHAR(500),
        calificacion DECIMAL(3,2) DEFAULT 0.00,
        total_ventas INT DEFAULT 0,
        is_aprobado TINYINT(1) DEFAULT 0,
        is_activo TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      // Poblar vendedores desde usuarios con rol=vendedor (INSERT IGNORE es idempotente)
      `INSERT IGNORE INTO vendedores (id_usuario, nombre_tienda, slug)
        SELECT id, nombre, CONCAT(
          LOWER(REGEXP_REPLACE(REGEXP_REPLACE(nombre, '[^a-zA-Z0-9 ]', ''), ' +', '-')),
          '-', id
        ) FROM usuarios WHERE rol = 'vendedor'`,

      // ── usuarios: nuevas columnas ──────────────────────────────────────
      `ALTER TABLE usuarios ADD COLUMN telefono VARCHAR(20) DEFAULT NULL`,
      `ALTER TABLE usuarios ADD COLUMN avatar_url VARCHAR(500) DEFAULT NULL`,
      `ALTER TABLE usuarios ADD COLUMN is_activo TINYINT(1) DEFAULT 1`,
      `ALTER TABLE usuarios ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
      `ALTER TABLE usuarios ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
      `ALTER TABLE usuarios ADD COLUMN deleted_at DATETIME DEFAULT NULL`,

      // ── productos: renombrar FK y nuevas columnas ──────────────────────
      `ALTER TABLE productos ADD COLUMN id_vendedor INT DEFAULT NULL`,
      `ALTER TABLE productos ADD COLUMN slug VARCHAR(220) DEFAULT NULL`,
      `ALTER TABLE productos ADD COLUMN precio_descuento DECIMAL(10,2) DEFAULT NULL`,
      `ALTER TABLE productos ADD COLUMN calificacion_prom DECIMAL(3,2) DEFAULT 0.00`,
      `ALTER TABLE productos ADD COLUMN total_resenas INT DEFAULT 0`,
      `ALTER TABLE productos ADD COLUMN is_activo TINYINT(1) DEFAULT 1`,
      `ALTER TABLE productos ADD COLUMN deleted_at DATETIME DEFAULT NULL`,
      // Renombrar timestamps camelCase → snake_case
      `ALTER TABLE productos CHANGE COLUMN \`createdAt\` \`created_at\` DATETIME DEFAULT NULL`,
      `ALTER TABLE productos CHANGE COLUMN \`updatedAt\` \`updated_at\` DATETIME DEFAULT NULL`,
      // Migrar vendedor_id → id_vendedor a través de la tabla vendedores
      `UPDATE productos p
        JOIN vendedores v ON p.vendedor_id = v.id_usuario
        SET p.id_vendedor = v.id
        WHERE p.id_vendedor IS NULL AND p.vendedor_id IS NOT NULL`,

      // ── categorias: nuevas columnas ───────────────────────────────────
      `ALTER TABLE categorias ADD COLUMN slug VARCHAR(120) DEFAULT NULL`,
      `ALTER TABLE categorias ADD COLUMN icono_url VARCHAR(500) DEFAULT NULL`,
      `ALTER TABLE categorias ADD COLUMN is_activo TINYINT(1) DEFAULT 1`,
      `ALTER TABLE categorias ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`,
      `ALTER TABLE categorias ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,

      // ── pedidos: nuevas columnas y migrar FK ──────────────────────────
      `ALTER TABLE pedidos ADD COLUMN id_usuario INT DEFAULT NULL`,
      `ALTER TABLE pedidos ADD COLUMN id_direccion INT DEFAULT NULL`,
      `ALTER TABLE pedidos ADD COLUMN metodo_pago VARCHAR(20) DEFAULT 'stripe'`,
      `ALTER TABLE pedidos ADD COLUMN referencia_wompi VARCHAR(100) DEFAULT NULL`,
      `ALTER TABLE pedidos ADD COLUMN stripe_payment_intent_id VARCHAR(100) DEFAULT NULL`,
      `ALTER TABLE pedidos ADD COLUMN deleted_at DATETIME DEFAULT NULL`,
      `ALTER TABLE pedidos CHANGE COLUMN \`createdAt\` \`created_at\` DATETIME DEFAULT NULL`,
      `ALTER TABLE pedidos CHANGE COLUMN \`updatedAt\` \`updated_at\` DATETIME DEFAULT NULL`,
      // Migrar UsuarioId → id_usuario
      `UPDATE pedidos SET id_usuario = UsuarioId WHERE id_usuario IS NULL AND UsuarioId IS NOT NULL`,

      // ── resenas: agregar FKs explícitas y renombrar timestamps ─────────
      `ALTER TABLE resenas ADD COLUMN id_usuario INT DEFAULT NULL`,
      `ALTER TABLE resenas ADD COLUMN id_producto INT DEFAULT NULL`,
      `ALTER TABLE resenas ADD COLUMN id_pedido INT DEFAULT NULL`,
      `ALTER TABLE resenas CHANGE COLUMN \`createdAt\` \`created_at\` DATETIME DEFAULT NULL`,
      `ALTER TABLE resenas CHANGE COLUMN \`updatedAt\` \`updated_at\` DATETIME DEFAULT NULL`,
      // Migrar UsuarioId/ProductoId → id_usuario/id_producto
      `UPDATE resenas SET id_usuario = UsuarioId, id_producto = ProductoId WHERE id_usuario IS NULL`,

      // ── detalle_pedido: migrar datos de tabla vieja a nueva ───────────
      `INSERT IGNORE INTO detalle_pedido (id_pedido, id_producto, cantidad, precio_unitario)
        SELECT PedidoId, ProductoId, cantidad, precio_unitario
        FROM detalle_pedidos
        WHERE PedidoId IS NOT NULL AND ProductoId IS NOT NULL`,
      `DROP TABLE IF EXISTS detalle_pedidos`,

      // ── pedidos: extender ENUM de estado (ya existía en version anterior) ─
      `ALTER TABLE pedidos MODIFY COLUMN estado ENUM('pendiente','procesando','enviado','entregado','completado','cancelado') DEFAULT 'pendiente'`,
      // ── pedidos: columnas heredadas de versión anterior ────────────────
      `ALTER TABLE pedidos ADD COLUMN direccion_envio VARCHAR(255) DEFAULT NULL`,
      `ALTER TABLE pedidos ADD COLUMN notas TEXT DEFAULT NULL`,
      // ── usuarios: columnas de recuperación de contraseña ──────────────
      `ALTER TABLE usuarios ADD COLUMN reset_token VARCHAR(64) DEFAULT NULL`,
      `ALTER TABLE usuarios ADD COLUMN reset_token_expires DATETIME DEFAULT NULL`,

      // ── índices: agregar donde no existen ─────────────────────────────
      `ALTER TABLE productos ADD INDEX idx_productos_id_vendedor (id_vendedor)`,
      `ALTER TABLE productos ADD INDEX idx_productos_id_categoria (id_categoria)`,
      `ALTER TABLE pedidos ADD INDEX idx_pedidos_id_usuario (id_usuario)`,
      `ALTER TABLE resenas ADD INDEX idx_resenas_id_producto (id_producto)`,
      `ALTER TABLE resenas ADD INDEX idx_resenas_id_usuario (id_usuario)`,
      `ALTER TABLE resenas ADD UNIQUE INDEX idx_resenas_uq_usuario_producto (id_usuario, id_producto)`,

      // ── direcciones: renombrar columnas al nuevo esquema ─────────────────
      `ALTER TABLE direcciones CHANGE COLUMN nombre_receptor nombre_destinatario VARCHAR(100) NOT NULL DEFAULT ''`,
      `ALTER TABLE direcciones CHANGE COLUMN es_principal is_principal TINYINT(1) DEFAULT 0`,

      // ── tablas nuevas ──────────────────────────────────────────────────
      // transacciones: recrear con esquema correcto (tabla vieja tenía esquema diferente)
      `DROP TABLE IF EXISTS transacciones`,
      `CREATE TABLE IF NOT EXISTS transacciones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        id_pedido INT NOT NULL,
        id_usuario INT NOT NULL,
        pasarela ENUM('stripe','wompi') NOT NULL,
        referencia VARCHAR(100) NOT NULL,
        estado ENUM('pendiente','aprobada','rechazada','reembolsada') DEFAULT 'pendiente',
        monto DECIMAL(10,2) NOT NULL,
        moneda VARCHAR(3) DEFAULT 'COP',
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS carrito (
        id INT AUTO_INCREMENT PRIMARY KEY,
        id_usuario INT NOT NULL,
        id_producto INT NOT NULL,
        cantidad INT NOT NULL DEFAULT 1,
        UNIQUE KEY uk_carrito_usuario_producto (id_usuario, id_producto)
      )`,
      `CREATE TABLE IF NOT EXISTS direcciones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        id_usuario INT NOT NULL,
        nombre_destinatario VARCHAR(100) NOT NULL,
        direccion VARCHAR(255) NOT NULL,
        ciudad VARCHAR(100) NOT NULL,
        departamento VARCHAR(100) NOT NULL,
        codigo_postal VARCHAR(20),
        telefono VARCHAR(20),
        is_principal TINYINT(1) DEFAULT 0
      )`,
    ];

    for (const sql of migraciones) {
      try { await sequelize.query(sql); } catch (_) { /* ya aplicado o tabla nueva — ok */ }
    }

    // Sincronizar modelos — solo crea tablas nuevas, no altera las existentes
    await sequelize.sync();
    logger.info('✅ Modelos sincronizados con MySQL');

    app.listen(PORT, () => {
      logger.info('🚀 TechMarket API iniciada', {
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

// ── 15. ERRORES NO CAPTURADOS ─────────────────────────────────
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Promesa rechazada sin manejar', { reason: reason?.message || reason, promise });
});

process.on('uncaughtException', (error) => {
  logger.logError('uncaughtException', error);
  setTimeout(() => process.exit(1), 1000);
});

iniciarServidor();
