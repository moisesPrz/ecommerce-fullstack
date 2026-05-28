const Pedido       = require('../models/Pedido');
const DetallePedido = require('../models/DetallePedido');
const Producto     = require('../models/Producto');
const Usuario      = require('../models/Usuario');
const Vendedor     = require('../models/Vendedor');
const logger       = require('../config/logger');
const { enviarEmail, templates } = require('../config/mailer');

// Helper: obtener el perfil Vendedor del usuario autenticado
const getVendedor = async (idUsuario) => {
  const vendedor = await Vendedor.findOne({ where: { id_usuario: idUsuario } });
  return vendedor;
};

// ─── DASHBOARD ───────────────────────────────────────────────
exports.getDashboard = async (req, res) => {
  try {
    const vendedor = await getVendedor(req.usuario.id);
    if (!vendedor) return res.status(403).json({ error: 'Perfil de vendedor no encontrado' });

    const totalProductos = await Producto.count({ where: { id_vendedor: vendedor.id } });

    const totalPedidos = await Pedido.count({
      include: [{
        model: Producto,
        where: { id_vendedor: vendedor.id },
        required: true,
        through: { model: DetallePedido, attributes: [] },
        attributes: [],
      }],
      distinct: true,
      col: 'Pedido.id',
    });

    const detalles = await DetallePedido.findAll({
      attributes: ['precio_unitario', 'cantidad'],
      include: [{
        model: Producto,
        attributes: [],
        where: { id_vendedor: vendedor.id },
        required: true,
      }],
    });

    const totalVentas = detalles.reduce((sum, d) =>
      sum + (parseFloat(d.precio_unitario || 0) * (d.cantidad || 0)), 0
    );

    res.json({
      totalProductos,
      totalPedidos,
      totalVentas: totalVentas.toFixed(2),
      pedidosMes: totalPedidos,
    });
  } catch (error) {
    logger.error('Error en dashboard vendedor', { error: error.message });
    res.status(500).json({ error: 'Error al cargar el dashboard' });
  }
};

// ─── MIS PRODUCTOS ────────────────────────────────────────────
exports.getMisProductos = async (req, res) => {
  try {
    const vendedor = await getVendedor(req.usuario.id);
    if (!vendedor) return res.status(403).json({ error: 'Perfil de vendedor no encontrado' });

    const pagina = Math.max(1, parseInt(req.query.pagina) || 1);
    const limite = Math.min(50, Math.max(1, parseInt(req.query.limite) || 10));
    const offset = (pagina - 1) * limite;

    const { count, rows } = await Producto.findAndCountAll({
      where: { id_vendedor: vendedor.id },
      order: [['id', 'DESC']],
      limit: limite,
      offset,
    });

    res.json({
      productos: rows,
      total: count,
      pagina,
      totalPaginas: Math.ceil(count / limite),
    });
  } catch (error) {
    logger.error('Error al obtener productos del vendedor', { error: error.message });
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// ─── MIS PEDIDOS RECIBIDOS ────────────────────────────────────
exports.getMisPedidosRecibidos = async (req, res) => {
  try {
    const vendedor = await getVendedor(req.usuario.id);
    if (!vendedor) return res.status(403).json({ error: 'Perfil de vendedor no encontrado' });

    const pagina = Math.max(1, parseInt(req.query.pagina) || 1);
    const limite = Math.min(50, Math.max(1, parseInt(req.query.limite) || 10));
    const offset = (pagina - 1) * limite;

    const { count, rows } = await Pedido.findAndCountAll({
      include: [
        { model: Usuario, attributes: ['nombre', 'email'] },
        {
          model: Producto,
          through: { model: DetallePedido, attributes: ['cantidad', 'precio_unitario'] },
          where: { id_vendedor: vendedor.id },
          required: true,
          attributes: ['id', 'nombre', 'imagen_url'],
        },
      ],
      order: [['id', 'DESC']],
      limit: limite,
      offset,
      distinct: true,
      col: 'Pedido.id',
    });

    const resultado = rows.map(p => {
      const obj = p.toJSON();
      const subtotal = (obj.Productos || []).reduce((sum, prod) => {
        return sum + (parseFloat(prod.DetallePedido?.precio_unitario || 0) * (prod.DetallePedido?.cantidad || 0));
      }, 0);
      return { ...obj, subtotal: subtotal.toFixed(2) };
    });

    res.json({
      pedidos: resultado,
      total: count,
      pagina,
      totalPaginas: Math.ceil(count / limite),
    });
  } catch (error) {
    logger.error('Error al obtener pedidos del vendedor', { error: error.message });
    res.status(500).json({ error: 'Error al cargar pedidos' });
  }
};

// ─── CAMBIAR ESTADO DE PEDIDO ─────────────────────────────────
exports.actualizarEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const vendedor = await getVendedor(req.usuario.id);
    if (!vendedor) return res.status(403).json({ error: 'Perfil de vendedor no encontrado' });

    const estadosValidos = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    // Verificar que el pedido contiene al menos un producto de este vendedor
    const tieneProductos = await DetallePedido.findOne({
      where: { id_pedido: id },
      include: [{
        model: Producto,
        where: { id_vendedor: vendedor.id },
        required: true,
        attributes: [],
      }],
    });
    if (!tieneProductos) {
      return res.status(403).json({ error: 'No tienes productos en este pedido' });
    }

    const pedido = await Pedido.findByPk(id);
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });

    await pedido.update({ estado });

    const estadosQueNotifican = ['procesando', 'enviado', 'entregado', 'cancelado'];
    if (estadosQueNotifican.includes(estado)) {
      try {
        const usuario = await Usuario.findByPk(pedido.id_usuario, { attributes: ['nombre', 'email'] });
        if (usuario) {
          const { subject, html } = templates.cambioEstadoPedido({ nombre: usuario.nombre, pedidoId: id, estado });
          await enviarEmail({ to: usuario.email, subject, html });
        }
      } catch (_) {}
    }

    res.json({ message: 'Estado actualizado', pedido });
  } catch (error) {
    logger.error('Error al actualizar estado de pedido', { error: error.message });
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
};
