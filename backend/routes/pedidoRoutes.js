// backend/routes/pedidoRoutes.js
const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const path = require('path');

// Middleware de seguridad
const authMiddlewarePath = path.join(__dirname, '..', 'middleware', 'authMiddleware');
const { verificarToken } = require(authMiddlewarePath);
// Rutas
router.post('/', verificarToken, pedidoController.crearPedido);
router.get('/mis-pedidos', verificarToken, pedidoController.obtenerMisPedidos);
module.exports = router;