// ARCHIVO: backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// ─── VERIFICAR TOKEN ─────────────────────────────────────
const verificarToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await Usuario.findByPk(decoded.id);
    if (!usuario) return res.status(401).json({ error: 'Usuario no encontrado' });

    req.usuario = usuario;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

// ─── VERIFICAR ROL ADMIN ─────────────────────────────────
const esAdmin = (req, res, next) => {
  if (req.usuario?.rol !== 'administrador') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol administrador' });
  }
  next();
};

// ─── VERIFICAR ROL VENDEDOR O ADMIN ─────────────────────
const esVendedor = (req, res, next) => {
  if (!['vendedor', 'administrador'].includes(req.usuario?.rol)) {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol vendedor' });
  }
  next();
};

module.exports = { verificarToken, esAdmin, esVendedor };
