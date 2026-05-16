/**
 * ARCHIVO: backend/middleware/errorHandler.js
 * 
 * PROPÓSITO: Capturar y manejar TODOS los errores no controlados.
 * 
 * PRINCIPIO: En producción NUNCA mostrar stack traces al cliente.
 * Solo mostrar mensajes genéricos y registrar el detalle en los logs.
 * 
 * UBICACIÓN: Debe ser el ÚLTIMO middleware en server.js
 */

const logger = require('../config/logger');

/**
 * Manejador global de errores de Express
 * Se activa cuando se llama next(error) en cualquier parte
 */
const errorHandler = (err, req, res, next) => {
  // Registrar el error completo en logs
  logger.logError('errorHandler', err, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    usuario: req.usuario?.id || 'anónimo',
  });

  // ── Errores conocidos de Sequelize ──────────────────────

  // Registro duplicado (email ya existe, etc.)
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      success: false,
      message: 'Ya existe un registro con esos datos',
      campo: err.errors?.[0]?.path,
    });
  }

  // Error de validación de Sequelize
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación en la base de datos',
      errores: err.errors?.map(e => ({ campo: e.path, mensaje: e.message })),
    });
  }

  // Clave foránea inválida
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Referencia a un registro que no existe',
    });
  }

  // ── Errores de JWT ──────────────────────────────────────

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token de autenticación inválido',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'La sesión ha expirado. Por favor inicia sesión nuevamente',
    });
  }

  // ── Errores de Multer (archivos) ────────────────────────

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'El archivo es demasiado grande. Máximo 5MB',
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Campo de archivo inesperado',
    });
  }

  // ── Error genérico ──────────────────────────────────────

  const statusCode = err.status || err.statusCode || 500;
  const esProd = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    success: false,
    message: esProd
      ? 'Error interno del servidor. Nuestro equipo ha sido notificado.'
      : err.message,
    // Solo mostrar stack en desarrollo
    ...(esProd ? {} : { stack: err.stack }),
  });
};

/**
 * Manejador de rutas no encontradas (404)
 * Se activa cuando ninguna ruta coincide
 */
const notFound = (req, res) => {
  logger.warn(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, {
    ip: req.ip,
  });

  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
};

module.exports = { errorHandler, notFound };
