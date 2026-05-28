// backend/routes/pedidoRoutes.js
const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const path = require('path');

// Middleware de seguridad
const authMiddlewarePath = path.join(__dirname, '..', 'middleware', 'authMiddleware');
const { verificarToken } = require(authMiddlewarePath);
const { validarCrearPedido } = require('../middleware/validaciones');

// Rutas
router.post('/', verificarToken, validarCrearPedido, pedidoController.crearPedido);
router.get('/', verificarToken, pedidoController.obtenerMisPedidos);
router.get('/mis-pedidos', verificarToken, pedidoController.obtenerMisPedidos); // alias mantenido por compatibilidad
module.exports = router;