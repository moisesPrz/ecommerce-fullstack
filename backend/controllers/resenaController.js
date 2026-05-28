const { fn, col } = require('sequelize');
const Resena   = require('../models/Resena');
const Usuario  = require('../models/Usuario');
const Producto = require('../models/Producto');
const logger   = require('../config/logger');

const recalcularRating = async (id_producto) => {
  const res = await Resena.findOne({
    where: { id_producto },
    attributes: [[fn('AVG', col('calificacion')), 'promedio'], [fn('COUNT', col('id')), 'total']],
    raw: true,
  });
  await Producto.update(
    { calificacion_prom: parseFloat(res?.promedio || 0).toFixed(2), total_resenas: parseInt(res?.total || 0) },
    { where: { id: id_producto } }
  );
};

exports.obtenerResenasProducto = async (req, res) => {
  try {
    const { id } = req.params;

    const producto = await Producto.findByPk(id);
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });

    const resenas = await Resena.findAll({
      where: { id_producto: id },
      include: [{ model: Usuario, attributes: ['nombre'] }],
      order: [['createdAt', 'DESC']],
    });

    const promedio = resenas.length > 0
      ? resenas.reduce((acc, r) => acc + r.calificacion, 0) / resenas.length
      : 0;

    res.json({
      resenas,
      promedio: Math.round(promedio * 10) / 10,
      total: resenas.length,
    });
  } catch (err) {
    logger.error('Error al obtener reseñas', { error: err.message });
    res.status(500).json({ message: 'Error al obtener reseñas' });
  }
};

exports.crearResena = async (req, res) => {
  try {
    const { id_producto, calificacion, comentario } = req.body;
    const id_usuario = req.usuario.id;

    if (!calificacion || calificacion < 1 || calificacion > 5) {
      return res.status(400).json({ message: 'La calificación debe estar entre 1 y 5' });
    }
    if (!id_producto) {
      return res.status(400).json({ message: 'id_producto es obligatorio' });
    }

    const producto = await Producto.findByPk(id_producto);
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });

    const existe = await Resena.findOne({ where: { id_usuario, id_producto } });
    if (existe) {
      return res.status(400).json({ message: 'Ya dejaste una reseña para este producto' });
    }

    const resena = await Resena.create({
      id_usuario,
      id_producto,
      calificacion: parseInt(calificacion),
      comentario: comentario?.trim() || null,
    });

    const resenaConUsuario = await Resena.findByPk(resena.id, {
      include: [{ model: Usuario, attributes: ['nombre'] }],
    });

    await recalcularRating(id_producto);

    res.status(201).json(resenaConUsuario);
  } catch (err) {
    logger.error('Error al crear reseña', { error: err.message });
    res.status(500).json({ message: 'Error al crear reseña' });
  }
};

exports.eliminarResena = async (req, res) => {
  try {
    const { id } = req.params;
    const resena = await Resena.findByPk(id);
    if (!resena) return res.status(404).json({ message: 'Reseña no encontrada' });

    const esAutor = resena.id_usuario === req.usuario.id;
    const esAdmin = req.usuario.rol === 'administrador';
    if (!esAutor && !esAdmin) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar esta reseña' });
    }

    const id_producto = resena.id_producto;
    await resena.destroy();
    await recalcularRating(id_producto);
    res.json({ message: 'Reseña eliminada' });
  } catch (err) {
    logger.error('Error al eliminar reseña', { error: err.message });
    res.status(500).json({ message: 'Error al eliminar reseña' });
  }
};
