// ARCHIVO: backend/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Ruta: POST /api/pagos/create-payment-intent
router.post('/create-payment-intent', paymentController.crearIntentoPago);

module.exports = router;