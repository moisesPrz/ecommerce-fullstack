const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Vendedor = sequelize.define('Vendedor', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_usuario: { type: DataTypes.INTEGER, allowNull: false },
  nombre_tienda: { type: DataTypes.STRING(150), allowNull: false },
  slug: { type: DataTypes.STRING(170), allowNull: false, unique: true },
  descripcion: { type: DataTypes.TEXT, allowNull: true },
  logo_url: { type: DataTypes.STRING(500), allowNull: true },
  calificacion: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0.00 },
  total_ventas: { type: DataTypes.INTEGER, defaultValue: 0 },
  is_aprobado: { type: DataTypes.BOOLEAN, defaultValue: false },
  is_activo: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'vendedores',
  timestamps: true,
  underscored: true,
  indexes: [
    { unique: true, fields: ['id_usuario'], name: 'idx_vendedores_id_usuario' },
    { unique: true, fields: ['slug'], name: 'idx_vendedores_slug' },
  ],
});

module.exports = Vendedor;
