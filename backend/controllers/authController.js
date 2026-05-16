/**
 * ARCHIVO: backend/controllers/authController.js
 * 
 * PROPÓSITO: Manejar autenticación (registro, login).
 * 
 * MEJORAS APLICADAS:
 * - Logs en cada evento de autenticación
 * - Tiempo de respuesta constante en login (previene timing attacks)
 * - Mensajes de error genéricos (no revelan si el email existe)
 */

const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const logger  = require('../config/logger');

/**
 * POST /api/auth/register
 * Registra un nuevo usuario
 */
exports.registrar = async (req, res, next) => {
  try {
    const { nombre, email, password, rol = 'cliente' } = req.body;

    // Verificar si el email ya está registrado
    const existe = await Usuario.findOne({ where: { email } });
    if (existe) {
      logger.logAuth('register.email_duplicado', { email, ip: req.ip });
      return res.status(409).json({
        success: false,
        message: 'Ya existe una cuenta con ese correo electrónico',
      });
    }

    // Hash de contraseña (salt rounds = 12 para mayor seguridad)
    const hash = await bcrypt.hash(password, 12);

    // Crear usuario
    const nuevoUsuario = await Usuario.create({
      nombre: nombre.trim(),
      email,
      password: hash,
      rol,
    });

    // Generar JWT
    const token = jwt.sign(
      { id: nuevoUsuario.id, email: nuevoUsuario.email, rol: nuevoUsuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    logger.logAuth('register.exitoso', {
      userId: nuevoUsuario.id,
      email,
      rol,
      ip: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'Cuenta creada exitosamente',
      token,
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol,
      },
    });

  } catch (error) {
    next(error); // Pasa al errorHandler global
  }
};

/**
 * POST /api/auth/login
 * Inicia sesión y devuelve JWT
 * 
 * SEGURIDAD: Siempre retorna el mismo mensaje si email o contraseña fallan.
 * Esto previene que un atacante sepa si el email existe.
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const mensajeError = 'Credenciales incorrectas'; // Mensaje genérico

    // Buscar usuario (incluir password para comparar)
    const usuario = await Usuario.findOne({ where: { email } });

    // IMPORTANTE: Siempre hacer bcrypt.compare aunque el usuario no exista.
    // Esto previene timing attacks (medir el tiempo de respuesta para saber si el email existe).
    const hashFalso = '$2b$12$invalidhashfortimingreasons000000000000000000000000000';
    const hashReal  = usuario?.password || hashFalso;
    const passwordValida = await bcrypt.compare(password, hashReal);

    if (!usuario || !passwordValida) {
      logger.logAuth('login.fallido', { email, ip: req.ip });
      return res.status(401).json({ success: false, message: mensajeError });
    }

    // Generar JWT
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    logger.logAuth('login.exitoso', {
      userId: usuario.id,
      email,
      rol: usuario.rol,
      ip: req.ip,
    });

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    });

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Retorna el perfil del usuario autenticado
 */
exports.getMe = async (req, res, next) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id, {
      attributes: { exclude: ['password'] },
    });

    if (!usuario) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    res.json({ success: true, usuario });
  } catch (error) {
    next(error);
  }
};
