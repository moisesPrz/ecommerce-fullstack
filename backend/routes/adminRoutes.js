// ARCHIVO: backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verificarToken, esAdmin } = require('../middleware/authMiddleware');

router.use(verificarToken, esAdmin);

router.get('/dashboard', adminController.getDashboard);
router.get('/usuarios', adminController.getUsuarios);
router.put('/usuarios/:id/rol', adminController.cambiarRolUsuario);
router.get('/pedidos', adminController.getTodosPedidos);
router.put('/pedidos/:id/estado', adminController.actualizarEstadoPedido);

module.exports = router;
