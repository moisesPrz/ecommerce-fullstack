// ARCHIVO: backend/controllers/productoController.js
const cloudinary = require('../config/cloudinary'); 
const { Op } = require('sequelize'); 
const Producto = require('../models/Producto');
const fs = require('fs'); // Para borrar el archivo temporal del servidor

/**
 * @desc Crear un nuevo producto con imagen (CREATE)
 * @route POST /api/productos
 */
exports.crearProducto = async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock, id_categoria } = req.body;
        let imagen_url = req.body.imagen_url || ''; // Por si mandan URL directa

        // SI VIENE UN ARCHIVO (IMAGEN SUBIDA)
        if (req.file) {
            // 1. Subir a Cloudinary
            const resultado = await cloudinary.uploader.upload(req.file.path);
            // 2. Obtener la URL segura de internet
            imagen_url = resultado.secure_url;
            
            // 3. Borrar el archivo temporal del disco duro de tu PC
            fs.unlinkSync(req.file.path); 
        }

        if (!nombre || !precio) {
            return res.status(400).json({ error: 'Nombre y precio obligatorios.' });
        }

        const nuevoProducto = await Producto.create({
            nombre, 
            descripcion, 
            precio, 
            stock: stock || 0, 
            imagen_url, // Guardamos la URL (sea de Cloudinary o texto)
            id_categoria
        });

        res.status(201).json({ message: 'Producto creado.', producto: nuevoProducto });

    } catch (error) {
        console.error("Error al crear:", error);
        // Limpieza: Si falló algo pero el archivo quedó en 'uploads/', lo borramos
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        
        if (error.name === 'SequelizeUniqueConstraintError') {
             return res.status(400).json({ error: 'Ya existe un producto con este nombre.' });
        }
        res.status(500).json({ error: 'Error al crear el producto.' });
    }
};

/**
 * @desc Obtener productos CON FILTROS (Buscador y Categoría) (READ ALL)
 * @route GET /api/productos
 */
exports.obtenerProductos = async (req, res) => {
    try {
        const { busqueda, categoria } = req.query;

        let condiciones = {};

        // 1. Filtro por Nombre (Buscador)
        if (busqueda) {
            condiciones.nombre = { [Op.like]: `%${busqueda}%` };
        }

        // 2. Filtro por Categoría
        if (categoria) {
            condiciones.id_categoria = categoria;
        }

        const productos = await Producto.findAll({
            where: condiciones,
            order: [['createdAt', 'DESC']]
        });
        
        res.status(200).json(productos);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error al obtener los productos.' });
    }
};

/**
 * @desc Obtener un producto por ID (READ ONE)
 * @route GET /api/productos/:id
 */
exports.obtenerProductoPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const producto = await Producto.findByPk(id);
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado.' });
        res.status(200).json(producto);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al buscar producto.' });
    }
};

/**
 * @desc Actualizar producto e Imagen (UPDATE)
 * @route PUT /api/productos/:id
 */
exports.actualizarProducto = async (req, res) => {
    const { id } = req.params;
    try {
        const producto = await Producto.findByPk(id);
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado.' });

        // Preparamos los datos nuevos
        let datosActualizados = { ...req.body };

        // SI HAY NUEVA IMAGEN, la subimos a Cloudinary
        if (req.file) {
            const resultado = await cloudinary.uploader.upload(req.file.path);
            datosActualizados.imagen_url = resultado.secure_url;
            
            // Borrar temporal
            fs.unlinkSync(req.file.path);
        }

        await producto.update(datosActualizados);
        res.status(200).json({ message: 'Actualizado.', producto });

    } catch (error) {
        console.error("Error al actualizar:", error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: 'Error al actualizar.' });
    }
};

/**
 * @desc Eliminar producto (DELETE)
 * @route DELETE /api/productos/:id
 */
exports.eliminarProducto = async (req, res) => {
    const { id } = req.params;
    try {
        const resultado = await Producto.destroy({ where: { id: id } });
        if (resultado === 0) return res.status(404).json({ error: 'Producto no encontrado.' });
        res.status(200).json({ message: 'Eliminado.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'No se puede eliminar (posiblemente tenga ventas).' });
    }
};