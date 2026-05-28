const Categoria = require('../models/Categoria');
const logger    = require('../config/logger');

const toSlug = (nombre) =>
  nombre.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

exports.obtenerCategorias = async (_req, res) => {
  try {
    const categorias = await Categoria.findAll({ order: [['nombre', 'ASC']] });
    res.json(categorias);
  } catch (err) {
    logger.error('Error al obtener categorías', { error: err.message });
    res.status(500).json({ message: 'Error al obtener categorías' });
  }
};

exports.crearCategoria = async (req, res) => {
  try {
    const { nombre, descripcion, icono } = req.body;
    if (!nombre?.trim()) return res.status(400).json({ message: 'El nombre es obligatorio' });

    const slug = toSlug(nombre.trim());
    const categoria = await Categoria.create({ nombre: nombre.trim(), slug, descripcion, icono });
    res.status(201).json(categoria);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Ya existe una categoría con ese nombre' });
    }
    logger.error('Error al crear categoría', { error: err.message });
    res.status(500).json({ message: 'Error al crear categoría' });
  }
};

exports.actualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const categoria = await Categoria.findByPk(id);
    if (!categoria) return res.status(404).json({ message: 'Categoría no encontrada' });

    const datos = { ...req.body };
    if (datos.nombre) datos.slug = toSlug(datos.nombre);

    await categoria.update(datos);
    res.json(categoria);
  } catch (err) {
    logger.error('Error al actualizar categoría', { error: err.message });
    res.status(500).json({ message: 'Error al actualizar categoría' });
  }
};

exports.eliminarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await Categoria.destroy({ where: { id } });
    if (resultado === 0) return res.status(404).json({ message: 'Categoría no encontrada' });
    res.json({ message: 'Categoría eliminada' });
  } catch (err) {
    logger.error('Error al eliminar categoría', { error: err.message });
    res.status(500).json({ message: 'Error al eliminar categoría' });
  }
};
