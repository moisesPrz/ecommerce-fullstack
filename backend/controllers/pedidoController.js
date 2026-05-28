const Pedido       = require('../models/Pedido');
const DetallePedido = require('../models/DetallePedido');
const Producto     = require('../models/Producto');
const Usuario      = require('../models/Usuario');
const Vendedor     = require('../models/Vendedor');
const { sequelize } = require('../config/database');
const logger        = require('../config/logger');
const { enviarEmail, templates } = require('../config/mailer');

exports.crearPedido = async (req, res) => {
  const { items, paymentId } = req.body;
  const userId = req.usuario.id;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'El carrito está vacío' });
  }

  const t = await sequelize.transaction();
  try {
    // Validar stock con LOCK — elimina race condition en compras simultáneas
    for (const item of items) {
      const producto = await Producto.findByPk(item.id, { lock: t.LOCK.UPDATE, transaction: t });
      if (!producto) {
        await t.rollback();
        return res.status(400).json({ error: `Producto #${item.id} no existe` });
      }
      if (producto.stock < item.quantity) {
        await t.rollback();
        return res.status(400).json({ error: `Stock insuficiente para "${producto.nombre}"` });
      }
    }

    const total = items.reduce((sum, item) => sum + (item.precio * item.quantity), 0);

    const nuevoPedido = await Pedido.create(
      { total, estado: 'pendiente', id_usuario: userId, stripe_payment_intent_id: paymentId || null },
      { transaction: t }
    );

    const detalles = items.map(item => ({
      id_pedido: nuevoPedido.id,
      id_producto: item.id,
      cantidad: item.quantity,
      precio_unitario: item.precio,
    }));

    await DetallePedido.bulkCreate(detalles, { transaction: t });

    // Descontar stock dentro de la transacción
    for (const item of items) {
      await Producto.decrement('stock', { by: item.quantity, where: { id: item.id }, transaction: t });
    }

    await t.commit();

    // Emails: fuera de la transacción (best-effort, el pedido ya está confirmado)
    try {
      // Alerta de stock bajo a vendedores
      for (const item of items) {
        const producto = await Producto.findByPk(item.id);
        if (!producto || producto.stock > 5 || !producto.id_vendedor) continue;
        const vendedor = await Vendedor.findByPk(producto.id_vendedor, {
          include: [{ model: Usuario, attributes: ['nombre', 'email'] }],
        });
        if (vendedor?.Usuario) {
          const { subject, html } = templates.stockBajo({
            vendedorNombre: vendedor.Usuario.nombre,
            productoNombre: producto.nombre,
            stockActual: producto.stock,
            productoId: producto.id,
          });
          await enviarEmail({ to: vendedor.Usuario.email, subject, html });
        }
      }
    } catch (_) { /* best-effort: no bloquear la respuesta */ }

    try {
      const usuario = await Usuario.findByPk(userId, { attributes: ['nombre', 'email'] });
      if (usuario) {
        const { subject, html } = templates.confirmacionPedido({
          nombre: usuario.nombre,
          pedidoId: nuevoPedido.id,
          total,
          items: items.map(i => ({ nombre: i.nombre || `Producto #${i.id}`, cantidad: i.quantity, precio: i.precio })),
        });
        await enviarEmail({ to: usuario.email, subject, html });
      }
    } catch (_) { /* best-effort */ }

    res.status(201).json({ message: 'Compra realizada con éxito', pedidoId: nuevoPedido.id });

  } catch (error) {
    await t.rollback();
    logger.error('Error al crear pedido', { error: error.message });
    res.status(500).json({ error: 'Error al procesar la compra' });
  }
};

exports.obtenerMisPedidos = async (req, res) => {
  try {
    const userId = req.usuario.id;

    const pedidos = await Pedido.findAll({
      where: { id_usuario: userId },
      include: [
        {
          model: Producto,
          through: { model: DetallePedido, attributes: ['cantidad', 'precio_unitario'] },
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(pedidos);
  } catch (error) {
    logger.error('Error al obtener pedidos', { error: error.message });
    res.status(500).json({ error: 'Error al cargar el historial.' });
  }
};
