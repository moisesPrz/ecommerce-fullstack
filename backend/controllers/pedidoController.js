// ARCHIVO: backend/controllers/pedidoController.js
const Pedido = require('../models/Pedido');
const DetallePedido = require('../models/DetallePedido');
const Producto = require('../models/Producto');

// 1. FUNCIÓN PARA CREAR PEDIDO (Y DESCONTAR STOCK)
exports.crearPedido = async (req, res) => {
    try {
        const { items } = req.body;
        const userId = req.usuario.id; // Viene del token

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'El carrito está vacío' });
        }

        // Calcular total
        const total = items.reduce((sum, item) => sum + (item.precio * item.quantity), 0);

        // Crear cabecera
        const nuevoPedido = await Pedido.create({
            total,
            estado: 'completado',
            UsuarioId: userId
        });

        // Crear detalles
        const detalles = items.map(item => ({
            PedidoId: nuevoPedido.id,
            ProductoId: item.id,
            cantidad: item.quantity,
            precio_unitario: item.precio
        }));

        await DetallePedido.bulkCreate(detalles);

        // --- DESCONTAR STOCK ---
        for (const item of items) {
            const producto = await Producto.findByPk(item.id);
            if (producto) {
                await producto.decrement('stock', { by: item.quantity });
            }
        }

        res.status(201).json({ 
            message: 'Compra realizada con éxito', 
            pedidoId: nuevoPedido.id 
        });

    } catch (error) {
        console.error('Error al crear pedido:', error);
        res.status(500).json({ error: 'Error al procesar la compra' });
    }
};

// 2. FUNCIÓN PARA VER MIS PEDIDOS (HISTORIAL)
// Esta es la que te faltaba o estaba mal puesta
exports.obtenerMisPedidos = async (req, res) => {
    try {
        const userId = req.usuario.id;

        const pedidos = await Pedido.findAll({
            where: { UsuarioId: userId },
            include: [
                {
                    model: Producto,
                    through: { 
                        model: DetallePedido, 
                        attributes: ['cantidad', 'precio_unitario'] 
                    }
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(pedidos);

    } catch (error) {
        console.error('Error al obtener pedidos:', error);
        res.status(500).json({ error: 'Error al cargar el historial.' });
    }
};