// ARCHIVO: backend/routes/authRoutes.js

const express = require('express');
const router = express.Router();
// Importamos el controlador, que ahora tiene la función 'register'
const authController = require('../controllers/authController');

// Ruta POST para el registro de usuarios
// URL: /api/auth/register
router.post('/register', authController.register); // <--- Aquí ya no habrá error porque authController.register es una función
router.post('/login', authController.login)
// Exportar el router
module.exports = router;