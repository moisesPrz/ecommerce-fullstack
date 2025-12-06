// ARCHIVO: backend/controllers/paymentController.js
const Stripe = require('stripe');
// ⚠️ IMPORTANTE: Pega tu SECRET KEY real aquí abajo (mantenla secreta)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const Producto = require('../models/Producto');

exports.crearIntentoPago = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No hay items para cobrar' });
    }

    // 1. SEGURIDAD: Recalcular el total en el servidor
    // No confiamos en el precio que envía el frontend. Buscamos el precio real en la BD.
    let totalCalculado = 0;

    for (const item of items) {
      const productoReal = await Producto.findByPk(item.id);
      if (productoReal) {
        // Multiplicamos precio * cantidad
        totalCalculado += Number(productoReal.precio) * item.quantity;
      }
    }

    // 2. Stripe trabaja con CENTAVOS (Integers)
    // $20.00 se debe enviar como 2000
    const totalEnCentavos = Math.round(totalCalculado * 100);

    // 3. Crear el "PaymentIntent" en Stripe
    // Esto le dice a Stripe: "Prepárate para recibir un pago de X cantidad"
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalEnCentavos,
      currency: 'usd', // O 'cop', 'mxn', etc.
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // 4. Enviamos el "secreto" al frontend para que termine el pago
    res.send({
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error) {
    console.error("Error en Stripe:", error);
    res.status(500).json({ error: 'Error al iniciar el pago' });
  }
};