const winston = require('winston');
const path = require('path');
const fs = require('fs');

const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const esProd = process.env.NODE_ENV === 'production';

const formatoArchivo = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const formatoConsola = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const extras = Object.keys(meta).length ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level}: ${message}${extras}`;
  })
);

const logger = winston.createLogger({
  level: esProd ? 'info' : 'debug',
  transports: [
    new winston.transports.Console({
      format: formatoConsola,
      level: esProd ? 'info' : 'debug',
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: formatoArchivo,
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: formatoArchivo,
      maxsize: 10 * 1024 * 1024,
      maxFiles: 10,
    }),
  ],
  exitOnError: false,
});

logger.logAuth = (evento, datos) => {
  logger.info(`AUTH | ${evento}`, datos);
};

logger.logBusiness = (evento, datos) => {
  logger.info(`BUSINESS | ${evento}`, datos);
};

logger.logError = (contexto, error, datos = {}) => {
  logger.error(`ERROR | ${contexto}`, {
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    ...datos,
  });
};

module.exports = logger;
