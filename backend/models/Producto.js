const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Producto = sequelize.define('Producto', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_vendedor: { type: DataTypes.INTEGER, allowNull: true },
  id_categoria: { type: DataTypes.INTEGER, allowNull: true },
  nombre: { type: DataTypes.STRING(200), allowNull: false },
  slug: { type: DataTypes.STRING(220), allowNull: true },
  descripcion: { type: DataTypes.TEXT, allowNull: true },
  precio: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  precio_descuento: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  imagen_url: { type: DataTypes.STRING(500), allowNull: true },
  calificacion_prom: { type: DataTypes.DECIMAL(3, 2), defaultValue: 0.00 },
  total_resenas: { type: DataTypes.INTEGER, defaultValue: 0 },
  is_activo: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'productos',
  timestamps: true,
  underscored: true,
  paranoid: true,
  indexes: [
    { fields: ['id_vendedor'], name: 'idx_productos_id_vendedor' },
    { fields: ['id_categoria'], name: 'idx_productos_id_categoria' },
  ],
});

module.exports = Producto;
