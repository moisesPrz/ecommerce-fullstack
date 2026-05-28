const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Categoria = sequelize.define('Categoria', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  slug: { type: DataTypes.STRING(120), allowNull: true, unique: true },
  descripcion: { type: DataTypes.TEXT, allowNull: true },
  icono: { type: DataTypes.STRING(10), defaultValue: '📦' },
  icono_url: { type: DataTypes.STRING(500), allowNull: true },
  is_activo: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'categorias',
  timestamps: true,
  underscored: true,
});

module.exports = Categoria;
