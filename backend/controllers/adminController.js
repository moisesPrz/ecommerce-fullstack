const Usuario      = require('../models/Usuario');
const Producto     = require('../models/Producto');
const Pedido       = require('../models/Pedido');
const DetallePedido = require('../models/DetallePedido');
const logger       = require('../config/logger');
const { enviarEmail, templates } = require('../config/mailer');

exports.getDashboard = async (_req, res) => {
  try {
    const totalUsuarios  = await Usuario.count();
    const totalProductos = await Producto.count();
    const totalPedidos   = await Pedido.count();

    const detalles = await DetallePedido.findAll({ attributes: ['precio_unitario', 'cantidad'] });
    const totalVentas = detalles.reduce((sum, d) => sum + (parseFloat(d.precio_unitario || 0) * (d.cantidad || 0)), 0);

    const usuariosRecientes = await Usuario.findAll({
      attributes: ['id', 'nombre', 'email', 'rol'],
      order: [['id', 'DESC']],
      limit: 5,
    });

    const pedidosRecientes = await Pedido.findAll({
      include: [{ model: Usuario, attributes: ['nombre', 'email'] }],
      order: [['id', 'DESC']],
      limit: 5,
    });

    return res.json({
      estadisticas: { totalUsuarios, totalProductos, totalPedidos, totalVentas: totalVentas.toFixed(2) },
      usuariosRecientes,
      pedidosRecientes,
    });
  } catch (error) {
    logger.error('Error dashboard admin', { error: error.message });
    res.status(500).json({ error: 'Error al cargar dashboard', detalle: error.message });
  }
};

exports.getUsuarios = async (req, res) => {
  try {
    const pagina = Math.max(1, parseInt(req.query.pagina) || 1);
    const limite = Math.min(100, Math.max(1, parseInt(req.query.limite) || 20));
    const offset = (pagina - 1) * limite;

    const { count, rows } = await Usuario.findAndCountAll({
      attributes: ['id', 'nombre', 'email', 'rol', 'is_activo', 'createdAt'],
      order: [['id', 'DESC']],
      limit: limite,
      offset,
    });

    res.json({
      usuarios: rows,
      total: count,
      pagina,
      totalPaginas: Math.ceil(count / limite),
    });
  } catch (error) {
    logger.error('Error getUsuarios', { error: error.message });
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

exports.cambiarRolUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;
    const rolesValidos = ['cliente', 'vendedor', 'administrador'];
    if (!rolesValidos.includes(rol)) return res.status(400).json({ error: 'Rol invalido' });
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    await usuario.update({ rol });
    res.json({ message: 'Rol actualizado', usuario });
  } catch (error) {
    logger.error('Error al cambiar rol', { error: error.message });
    res.status(500).json({ error: 'Error al cambiar rol' });
  }
};

exports.getTodosPedidos = async (req, res) => {
  try {
    const pagina = Math.max(1, parseInt(req.query.pagina) || 1);
    const limite = Math.min(100, Math.max(1, parseInt(req.query.limite) || 20));
    const offset = (pagina - 1) * limite;

    const { count, rows } = await Pedido.findAndCountAll({
      include: [
        { model: Usuario, attributes: ['nombre', 'email'] },
        {
          model: Producto,
          through: { model: DetallePedido, attributes: ['cantidad', 'precio_unitario'] },
          attributes: ['nombre', 'imagen_url'],
        },
      ],
      order: [['id', 'DESC']],
      limit: limite,
      offset,
      distinct: true,
      col: 'Pedido.id',
    });

    res.json({
      pedidos: rows,
      total: count,
      pagina,
      totalPaginas: Math.ceil(count / limite),
    });
  } catch (error) {
    logger.error('Error getTodosPedidos', { error: error.message });
    res.status(500).json({ error: 'Error al cargar pedidos' });
  }
};

exports.actualizarEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
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
