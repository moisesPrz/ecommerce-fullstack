// ARCHIVO: backend/controllers/adminController.js
const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const Pedido = require('../models/Pedido');
const DetallePedido = require('../models/DetallePedido');

exports.getDashboard = async (req, res) => {
  try {
    const totalUsuarios = await Usuario.count();
    const totalProductos = await Producto.count();
    const totalPedidos = await Pedido.count();

    const detalles = await DetallePedido.findAll({ attributes: ['precio_unitario', 'cantidad'] });
    const totalVentas = detalles.reduce((sum, d) => sum + (parseFloat(d.precio_unitario || 0) * (d.cantidad || 0)), 0);

    const usuariosRecientes = await Usuario.findAll({
      attributes: ['id', 'nombre', 'email', 'rol'],
      order: [['id', 'DESC']],
      limit: 5
    });

    const pedidosRecientes = await Pedido.findAll({
      include: [{ model: Usuario, attributes: ['nombre', 'email'] }],
      order: [['id', 'DESC']],
      limit: 5
    });

    return res.json({
      estadisticas: { totalUsuarios, totalProductos, totalPedidos, totalVentas: totalVentas.toFixed(2) },
      usuariosRecientes,
      pedidosRecientes
    });
  } catch (error) {
    console.error('Error dashboard admin:', error.message);
    res.status(500).json({ error: 'Error al cargar dashboard', detalle: error.message });
  }
};

exports.getUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nombre', 'email', 'rol'],
      order: [['id', 'DESC']]
    });
    res.json(usuarios);
  } catch (error) {
    console.error('Error getUsuarios:', error.message);
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
    res.status(500).json({ error: 'Error al cambiar rol' });
  }
};

exports.getTodosPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({
      include: [
        { model: Usuario, attributes: ['nombre', 'email'] },
        { model: Producto, through: { model: DetallePedido, attributes: ['cantidad', 'precio_unitario'] }, attributes: ['nombre', 'imagen_url'] }
      ],
      order: [['id', 'DESC']]
    });
    res.json(pedidos);
  } catch (error) {
    console.error('Error getTodosPedidos:', error.message);
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
    res.json({ message: 'Estado actualizado', pedido });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
};
