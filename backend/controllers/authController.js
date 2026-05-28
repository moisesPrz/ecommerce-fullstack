const crypto = require('crypto');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require('sequelize');
const Usuario = require("../models/Usuario");
const Vendedor = require("../models/Vendedor");
const logger = require("../config/logger");
const { enviarEmail, templates } = require('../config/mailer');

exports.registrar = async (req, res, next) => {
  try {
    const { nombre, email, password, rol = "cliente" } = req.body;
    const existe = await Usuario.findOne({ where: { email } });
    if (existe) {
      return res.status(409).json({ success: false, message: "Ya existe una cuenta con ese correo" });
    }
    const hash = await bcrypt.hash(password, 12);
    const nuevo = await Usuario.create({ nombre: nombre.trim(), email, hash_contrasena: hash, rol });

    // Crear perfil de vendedor automáticamente al registrarse con ese rol
    if (rol === 'vendedor') {
      const baseSlug = nombre.trim().toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      await Vendedor.create({
        id_usuario: nuevo.id,
        nombre_tienda: nombre.trim(),
        slug: `${baseSlug}-${nuevo.id}`,
      });
    }

    const token = jwt.sign(
      { id: nuevo.id, email: nuevo.email, rol: nuevo.rol },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    logger.logAuth("register.exitoso", { userId: nuevo.id, email, rol, ip: req.ip });
    res.status(201).json({
      success: true, token,
      usuario: { id: nuevo.id, nombre: nuevo.nombre, email: nuevo.email, rol: nuevo.rol }
    });
  } catch (error) { next(error); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ where: { email } });
    const hashFalso = "$2b$12$invalidhashfortimingreasons000000000000000000000000000";
    const hashReal = usuario?.hash_contrasena || hashFalso;
    const valida = await bcrypt.compare(password, hashReal);
    if (!usuario || !valida) {
      logger.logAuth("login.fallido", { email, ip: req.ip });
      return res.status(401).json({ success: false, message: "Credenciales incorrectas" });
    }
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    logger.logAuth("login.exitoso", { userId: usuario.id, email, rol: usuario.rol, ip: req.ip });
    res.json({
      success: true, token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
    });
  } catch (error) { next(error); }
};

exports.getMe = async (req, res, next) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id, {
      attributes: { exclude: ["hash_contrasena"] }
    });
    if (!usuario) return res.status(404).json({ success: false, message: "Usuario no encontrado" });
    res.json({ success: true, usuario });
  } catch (error) { next(error); }
};
exports.actualizarPerfil = async (req, res, next) => {
  try {
    const { nombre } = req.body;
    if (!nombre || nombre.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Nombre inválido' });
    }
    const usuario = await Usuario.findByPk(req.usuario.id);
    if (!usuario) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    await usuario.update({ nombre: nombre.trim() });
    res.json({ success: true, message: 'Perfil actualizado', usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol } });
  } catch (error) { next(error); }
};

exports.cambiarPassword = async (req, res, next) => {
  try {
    const { passwordActual, passwordNuevo } = req.body;
    if (!passwordActual || !passwordNuevo) {
      return res.status(400).json({ success: false, message: 'Faltan datos' });
    }
    if (passwordNuevo.length < 8) {
      return res.status(400).json({ success: false, message: 'La contraseña debe tener mínimo 8 caracteres' });
    }
    const usuario = await Usuario.findByPk(req.usuario.id);
    const valida = await bcrypt.compare(passwordActual, usuario.hash_contrasena);
    if (!valida) {
      return res.status(401).json({ success: false, message: 'Contraseña actual incorrecta' });
    }
    const nuevoHash = await bcrypt.hash(passwordNuevo, 12);
    await usuario.update({ hash_contrasena: nuevoHash });
    logger.logAuth('password.cambiado', { userId: usuario.id, ip: req.ip });
    res.json({ success: true, message: 'Contraseña actualizada correctamente' });
  } catch (error) { next(error); }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email requerido' });

    const usuario = await Usuario.findOne({ where: { email } });
    // Always return 200 — don't reveal whether an email exists
    if (!usuario) return res.json({ success: true, message: 'Si ese correo existe, recibirás un enlace.' });

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await usuario.update({ reset_token: tokenHash, reset_token_expires: expires });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;
    const { subject, html } = templates.recuperarPassword({ nombre: usuario.nombre, link: resetUrl });
    await enviarEmail({ to: usuario.email, subject, html });

    logger.logAuth('password.reset.solicitado', { userId: usuario.id, ip: req.ip });
    res.json({ success: true, message: 'Si ese correo existe, recibirás un enlace.' });
  } catch (error) { next(error); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token y contraseña requeridos' });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: 'La contraseña debe tener mínimo 8 caracteres' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const usuario = await Usuario.findOne({
      where: { reset_token: tokenHash, reset_token_expires: { [Op.gt]: new Date() } },
    });

    if (!usuario) {
      return res.status(400).json({ success: false, message: 'El enlace es inválido o ha expirado' });
    }

    const nuevoHash = await bcrypt.hash(password, 12);
    await usuario.update({ hash_contrasena: nuevoHash, reset_token: null, reset_token_expires: null });

    logger.logAuth('password.reset.exitoso', { userId: usuario.id, ip: req.ip });
    res.json({ success: true, message: 'Contraseña restablecida. Ya puedes iniciar sesión.' });
  } catch (error) { next(error); }
};