// backend/routes/pedidoRoutes.js
const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');
const path = require('path');

// Middleware de seguridad
const authMiddlewarePath = path.join(__dirname, '..', 'middleware', 'authMiddleware');
const { verifyToken } = require(authMiddlewarePath);

// Rutas
router.post('/', verifyToken, pedidoController.crearPedido); // Crear compra
router.get('/mis-pedidos', verifyToken, pedidoController.obtenerMisPedidos); // <--- NUEVA RUTA (Ver historial)

module.exports = router;