const Direccion = require('../models/Direccion');
const logger    = require('../config/logger');

exports.listarDirecciones = async (req, res) => {
  try {
    const direcciones = await Direccion.findAll({
      where: { id_usuario: req.usuario.id },
      order: [['is_principal', 'DESC'], ['id', 'ASC']],
    });
    res.json(direcciones);
  } catch (err) {
    logger.error('Error al listar direcciones', { error: err.message });
    res.status(500).json({ error: 'Error al cargar direcciones' });
  }
};

exports.crearDireccion = async (req, res) => {
  try {
    const { nombre_destinatario, direccion, ciudad, departamento, codigo_postal, telefono, is_principal } = req.body;
    const id_usuario = req.usuario.id;

    const total = await Direccion.count({ where: { id_usuario } });
    const seraPrincipal = is_principal || total === 0;

    if (seraPrincipal) {
      await Direccion.update({ is_principal: false }, { where: { id_usuario } });
    }

    const nueva = await Direccion.create({
      id_usuario,
      nombre_destinatario,
      direccion,
      ciudad,
      departamento,
      codigo_postal: codigo_postal || null,
      telefono: telefono || null,
      is_principal: seraPrincipal,
    });

    res.status(201).json(nueva);
  } catch (err) {
    logger.error('Error al crear dirección', { error: err.message });
    res.status(500).json({ error: 'Error al crear dirección' });
  }
};

exports.actualizarDireccion = async (req, res) => {
  try {
    const { id } = req.params;
    const dir = await Direccion.findOne({ where: { id, id_usuario: req.usuario.id } });
    if (!dir) return res.status(404).json({ error: 'Dirección no encontrada' });

    const { nombre_destinatario, direccion, ciudad, departamento, codigo_postal, telefono, is_principal } = req.body;

    if (is_principal) {
      await Direccion.update({ is_principal: false }, { where: { id_usuario: req.usuario.id } });
    }

    await dir.update({ nombre_destinatario, direccion, ciudad, departamento, codigo_postal: codigo_postal || null, telefono: telefono || null, is_principal: !!is_principal });
    res.json(dir);
  } catch (err) {
    logger.error('Error al actualizar dirección', { error: err.message });
    res.status(500).json({ error: 'Error al actualizar dirección' });
  }
};

exports.eliminarDireccion = async (req, res) => {
  try {
    const { id } = req.params;
    const dir = await Direccion.findOne({ where: { id, id_usuario: req.usuario.id } });
    if (!dir) return res.status(404).json({ error: 'Dirección no encontrada' });

    const eraPrincipal = dir.is_principal;
    await dir.destroy();

    if (eraPrincipal) {
      const primera = await Direccion.findOne({ where: { id_usuario: req.usuario.id }, order: [['id', 'ASC']] });
      if (primera) await primera.update({ is_principal: true });
    }

    res.json({ message: 'Dirección eliminada' });
  } catch (err) {
    logger.error('Error al eliminar dirección', { error: err.message });
    res.status(500).json({ error: 'Error al eliminar dirección' });
  }
};

exports.establecerPrincipal = async (req, res) => {
  try {
    const { id } = req.params;
    const dir = await Direccion.findOne({ where: { id, id_usuario: req.usuario.id } });
    if (!dir) return res.status(404).json({ error: 'Dirección no encontrada' });

    await Direccion.update({ is_principal: false }, { where: { id_usuario: req.usuario.id } });
    await dir.update({ is_principal: true });

    res.json({ message: 'Dirección principal actualizada', direccion: dir });
  } catch (err) {
    logger.error('Error al establecer dirección principal', { error: err.message });
    res.status(500).json({ error: 'Error al actualizar' });
  }
};
