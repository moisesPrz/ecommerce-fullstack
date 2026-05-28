// ARCHIVO: backend/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verificarToken } = require('../middleware/authMiddleware');
const { validarIntentoPago } = require('../middleware/validaciones');

// Ruta: POST /api/pagos/create-payment-intent — requiere login
router.post('/create-payment-intent', verificarToken, validarIntentoPago, paymentController.crearIntentoPago);

module.exports = router;