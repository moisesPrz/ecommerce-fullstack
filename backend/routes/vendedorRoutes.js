// ARCHIVO: backend/routes/vendedorRoutes.js
const express = require('express');
const router = express.Router();
const vendedorController = require('../controllers/vendedorController');
const { verificarToken, esVendedor } = require('../middleware/authMiddleware');

router.use(verificarToken, esVendedor);

router.get('/dashboard', vendedorController.getDashboard);
router.get('/productos', vendedorController.getMisProductos);
router.get('/pedidos', vendedorController.getMisPedidosRecibidos);
router.put('/pedidos/:id/estado', vendedorController.actualizarEstadoPedido);

module.exports = router;
