// ARCHIVO: backend/controllers/vendedorController.js
const Pedido = require('../models/Pedido');
const DetallePedido = require('../models/DetallePedido');
const Producto = require('../models/Producto');
const Usuario = require('../models/Usuario');
const { Op } = require('sequelize');
const sequelize = require('../config/database').sequelize || require('../config/database');

// ─── DASHBOARD — Estadísticas del vendedor ───────────────
exports.getDashboard = async (req, res) => {
  try {
    const vendedorId = req.usuario.id;

    // Total de productos del vendedor
    const totalProductos = await Producto.count({
      where: { UsuarioId: vendedorId }
    });

    // Productos sin stock
    const sinStock = await Producto.count({
      where: { UsuarioId: vendedorId, stock: 0 }
    });

    // Pedidos que contienen productos del vendedor
    const misProductos = await Producto.findAll({
      where: { UsuarioId: vendedorId },
      attributes: ['id']
    });
    const misProductoIds = misProductos.map(p => p.id);

    // Detalles de pedidos con mis productos
    const detalles = await DetallePedido.findAll({
      where: { ProductoId: { [Op.in]: misProductoIds } },
      include: [
        { model: Producto, attributes: ['nombre', 'imagen_url', 'precio'] },
        {
          model: Pedido,
          attributes: ['id', 'estado', 'total', 'createdAt'],
          include: [{ model: Usuario, attributes: ['nombre', 'email'] }]
        }
      ],
      order: [[Pedido, 'createdAt', 'DESC']]
    });

    // Calcular ventas totales
    const totalVentas = detalles.reduce((sum, d) => {
      return sum + (parseFloat(d.precio_unitario) * d.cantidad);
    }, 0);

    // Pedidos únicos
    const pedidosUnicos = [...new Set(detalles.map(d => d.PedidoId))];

    // Últimas 5 ventas
    const ultimasVentas = detalles.slice(0, 5);

    return res.json({
      estadisticas: {
        totalProductos,
        sinStock,
        totalPedidos: pedidosUnicos.length,
        totalVentas: totalVentas.toFixed(2)
      },
      ultimasVentas
    });

  } catch (error) {
    console.error('Error en dashboard vendedor:', error);
    res.status(500).json({ error: 'Error al cargar el dashboard' });
  }
};

// ─── MIS PRODUCTOS ───────────────────────────────────────
exports.getMisProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll({
      where: { UsuarioId: req.usuario.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

// ─── MIS PEDIDOS RECIBIDOS ───────────────────────────────
exports.getMisPedidosRecibidos = async (req, res) => {
  try {
    const misProductos = await Producto.findAll({
      where: { UsuarioId: req.usuario.id },
      attributes: ['id']
    });
    const misProductoIds = misProductos.map(p => p.id);

    if (misProductoIds.length === 0) return res.json([]);

    const detalles = await DetallePedido.findAll({
      where: { ProductoId: { [Op.in]: misProductoIds } },
      include: [
        { model: Producto, attributes: ['nombre', 'imagen_url', 'precio'] },
        {
          model: Pedido,
          include: [{ model: Usuario, attributes: ['nombre', 'email'] }]
        }
      ],
      order: [[Pedido, 'createdAt', 'DESC']]
    });

    // Agrupar por pedido
    const pedidosMap = {};
    detalles.forEach(d => {
      const pedidoId = d.PedidoId;
      if (!pedidosMap[pedidoId]) {
        pedidosMap[pedidoId] = {
          id: pedidoId,
          estado: d.Pedido.estado,
          fecha: d.Pedido.createdAt,
          cliente: d.Pedido.Usuario,
          items: [],
          subtotal: 0
        };
      }
      pedidosMap[pedidoId].items.push({
        producto: d.Producto.nombre,
        imagen: d.Producto.imagen_url,
        cantidad: d.cantidad,
        precio: d.precio_unitario
      });
      pedidosMap[pedidoId].subtotal += parseFloat(d.precio_unitario) * d.cantidad;
    });

    res.json(Object.values(pedidosMap));
  } catch (error) {
    console.error('Error al obtener pedidos recibidos:', error);
    res.status(500).json({ error: 'Error al cargar pedidos' });
  }
};

// ─── CAMBIAR ESTADO DE PEDIDO ────────────────────────────
exports.actualizarEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const estadosValidos = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const pedido = await Pedido.findByPk(id);
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });

    await pedido.update({ estado });
    res.json({ message: 'Estado actualizado', pedido });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
};
