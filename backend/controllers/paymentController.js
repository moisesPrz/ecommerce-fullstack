const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const Producto = require('../models/Producto');
const logger   = require('../config/logger');

exports.crearIntentoPago = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No hay items para cobrar' });
    }

    // Recalcular total en el servidor (nunca confiar en precios del frontend)
    // y validar stock antes de cobrar — evita cobrar por items sin stock
    let totalCalculado = 0;

    for (const item of items) {
      const producto = await Producto.findByPk(item.id);
      if (!producto) {
        return res.status(400).json({ error: `Producto #${item.id} no encontrado` });
      }
      if (producto.stock < item.quantity) {
        return res.status(400).json({ error: `Stock insuficiente para "${producto.nombre}"` });
      }
      totalCalculado += Number(producto.precio) * item.quantity;
    }

    const totalEnCentavos = Math.round(totalCalculado * 100);

    // Stripe requiere mínimo 50 centavos
    if (totalEnCentavos < 50) {
      return res.status(400).json({ error: 'El monto mínimo de compra es $0.50' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalEnCentavos,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    });

    res.json({ clientSecret: paymentIntent.client_secret });

  } catch (error) {
    logger.error('Error al crear PaymentIntent de Stripe', { error: error.message });
    res.status(500).json({ error: 'Error al iniciar el pago' });
  }
};