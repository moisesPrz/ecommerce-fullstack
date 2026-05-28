const cloudinary = require('../config/cloudinary');
const { Op } = require('sequelize');
const Producto = require('../models/Producto');
const Vendedor = require('../models/Vendedor');
const logger   = require('../config/logger');
const fs       = require('fs');

exports.crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, id_categoria } = req.body;
    let imagen_url = req.body.imagen_url || '';

    if (req.file) {
      const resultado = await cloudinary.uploader.upload(req.file.path);
      imagen_url = resultado.secure_url;
      fs.unlinkSync(req.file.path);
    }

    if (!nombre || !precio) {
      return res.status(400).json({ error: 'Nombre y precio obligatorios.' });
    }

    // Obtener el perfil de vendedor del usuario autenticado
    const vendedor = await Vendedor.findOne({ where: { id_usuario: req.usuario.id } });

    // Auto-generar slug desde el nombre
    const slug = nombre.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const nuevoProducto = await Producto.create({
      nombre,
      descripcion,
      precio,
      stock: stock || 0,
      imagen_url,
      id_categoria,
      id_vendedor: vendedor?.id || null,
      slug: `${slug}-${Date.now()}`,
    });

    res.status(201).json({ message: 'Producto creado.', producto: nuevoProducto });

  } catch (error) {
    logger.error('Error al crear producto', { error: error.message });
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Ya existe un producto con este nombre.' });
    }
    res.status(500).json({ error: 'Error al crear el producto.' });
  }
};

exports.obtenerProductos = async (req, res) => {
  try {
    const {
      busqueda,
      categoria,
      precioMin,
      precioMax,
      orden = 'reciente',
      disponible,
      pagina = 1,
      limite = 20,
    } = req.query;

    const condiciones = {};

    if (busqueda) {
      condiciones.nombre = { [Op.like]: `%${busqueda}%` };
    }
    if (categoria) {
      condiciones.id_categoria = categoria;
    }
    if (precioMin || precioMax) {
      condiciones.precio = {};
      if (precioMin) condiciones.precio[Op.gte] = parseFloat(precioMin);
      if (precioMax) condiciones.precio[Op.lte] = parseFloat(precioMax);
    }
    if (disponible === 'true') {
      condiciones.stock = { [Op.gt]: 0 };
    }

    const ordenMap = {
      reciente:    [['createdAt', 'DESC']],
      precio_asc:  [['precio', 'ASC']],
      precio_desc: [['precio', 'DESC']],
      nombre:      [['nombre', 'ASC']],
    };
    const order = ordenMap[orden] || ordenMap.reciente;
    const offset = (parseInt(pagina) - 1) * parseInt(limite);

    const { count, rows } = await Producto.findAndCountAll({
      where: condiciones,
      order,
      limit: parseInt(limite),
      offset,
    });

    res.json({
      productos: rows,
      total: count,
      pagina: parseInt(pagina),
      totalPaginas: Math.ceil(count / parseInt(limite)),
    });

  } catch (error) {
    logger.error('Error al obtener productos', { error: error.message });
    res.status(500).json({ error: 'Error al obtener los productos.' });
  }
};

exports.obtenerProductoPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const producto = await Producto.findByPk(id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado.' });
    res.json(producto);
  } catch (error) {
    logger.error('Error al buscar producto', { error: error.message });
    res.status(500).json({ error: 'Error al buscar producto.' });
  }
};

exports.actualizarProducto = async (req, res) => {
  const { id } = req.params;
  try {
    const producto = await Producto.findByPk(id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado.' });

    const esAdmin = req.usuario?.rol === 'administrador';
    const vendedor = esAdmin ? null : await Vendedor.findOne({ where: { id_usuario: req.usuario.id } });
    const esPropietario = vendedor && producto.id_vendedor === vendedor.id;

    if (!esAdmin && !esPropietario) {
      return res.status(403).json({ error: 'No tienes permiso para editar este producto.' });
    }

    const CAMPOS_PERMITIDOS = ['nombre', 'descripcion', 'precio', 'stock', 'id_categoria', 'precio_descuento', 'is_activo'];
    const datosActualizados = {};
    CAMPOS_PERMITIDOS.forEach(campo => {
      if (req.body[campo] !== undefined) datosActualizados[campo] = req.body[campo];
    });

    if (req.file) {
      const resultado = await cloudinary.uploader.upload(req.file.path);
      datosActualizados.imagen_url = resultado.secure_url;
      fs.unlinkSync(req.file.path);
    }

    // Regenerar slug si cambia el nombre
    if (datosActualizados.nombre) {
      datosActualizados.slug = datosActualizados.nombre.toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }

    await producto.update(datosActualizados);
    res.json({ message: 'Actualizado.', producto });

  } catch (error) {
    logger.error('Error al actualizar producto', { error: error.message });
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Error al actualizar.' });
  }
};

exports.eliminarProducto = async (req, res) => {
  const { id } = req.params;
  try {
    const producto = await Producto.findByPk(id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado.' });

    const esAdmin = req.usuario?.rol === 'administrador';
    const vendedor = esAdmin ? null : await Vendedor.findOne({ where: { id_usuario: req.usuario.id } });
    const esPropietario = vendedor && producto.id_vendedor === vendedor.id;

    if (!esAdmin && !esPropietario) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar este producto.' });
    }

    await producto.destroy(); // soft-delete (paranoid: true)
    res.json({ message: 'Eliminado.' });

  } catch (error) {
    logger.error('Error al eliminar producto', { error: error.message });
    res.status(500).json({ error: 'No se puede eliminar (posiblemente tenga ventas).' });
  }
};
