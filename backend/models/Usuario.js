const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  hash_contrasena: { type: DataTypes.STRING(255), allowNull: false },
  rol: { type: DataTypes.ENUM('cliente', 'vendedor', 'administrador'), defaultValue: 'cliente' },
  telefono: { type: DataTypes.STRING(20), allowNull: true },
  avatar_url: { type: DataTypes.STRING(500), allowNull: true },
  is_activo: { type: DataTypes.BOOLEAN, defaultValue: true },
  reset_token: { type: DataTypes.STRING(64), allowNull: true },
  reset_token_expires: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'usuarios',
  timestamps: true,
  underscored: true,
  paranoid: true,
  indexes: [
    { unique: true, fields: ['email'], name: 'idx_usuarios_email' },
  ],
});

module.exports = Usuario;
