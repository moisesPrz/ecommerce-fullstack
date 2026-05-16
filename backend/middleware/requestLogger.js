/**
 * ARCHIVO: backend/middleware/requestLogger.js
 * 
 * PROPÓSITO: Registrar cada petición HTTP con su tiempo de respuesta.
 * Esto permite detectar endpoints lentos y errores en producción.
 * 
 * PATRÓN: Wrapping del método res.end para capturar cuando termina la respuesta.
 */

const logger = require('../config/logger');

const requestLogger = (req, res, next) => {
  const inicio = Date.now();

  // Ignorar peticiones a assets estáticos
  if (req.path.includes('/favicon') || req.path.includes('/static')) {
    return next();
  }

  // Cuando la respuesta termina, registrar el log
  res.on('finish', () => {
    const duracion = Date.now() - inicio;
    const nivel = res.statusCode >= 500 ? 'error'
                : res.statusCode >= 400 ? 'warn'
                : 'http';

    logger[nivel](`${req.method} ${req.originalUrl} ${res.statusCode}`, {
      duracion: `${duracion}ms`,
      ip: req.ip || req.headers['x-forwarded-for'],
      userAgent: req.headers['user-agent']?.substring(0, 80),
      usuario: req.usuario?.id || null,
    });
  });

  next();
};

module.exports = requestLogger;
