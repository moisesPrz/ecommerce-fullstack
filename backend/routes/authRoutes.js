/**
 * ARCHIVO: backend/routes/authRoutes.js
 * 
 * MEJORAS: Ahora incluye validaciones en cada endpoint.
 * El orden middleware es: validación → autenticación → controlador
 */

const express = require('express');
const router  = express.Router();

const authController = require('../controllers/authController');
const { validarRegistro, validarLogin } = require('../middleware/validaciones');
const { verificarToken } = require('../middleware/authMiddleware');

// POST /api/auth/register — con validaciones
router.post('/register', validarRegistro, authController.registrar);

// POST /api/auth/login — con validaciones
router.post('/login', validarLogin, authController.login);

// GET /api/auth/me — ruta protegida
router.get('/me', verificarToken, authController.getMe);
// PUT /api/auth/perfil — actualizar nombre
router.put('/perfil', verificarToken, authController.actualizarPerfil);

// PUT /api/auth/cambiar-password — cambiar contraseña
router.put('/cambiar-password', verificarToken, authController.cambiarPassword);

// POST /api/auth/forgot-password — solicitar enlace de recuperación
router.post('/forgot-password', authController.forgotPassword);

// POST /api/auth/reset-password — confirmar nueva contraseña con token
router.post('/reset-password', authController.resetPassword);

module.exports = router;
