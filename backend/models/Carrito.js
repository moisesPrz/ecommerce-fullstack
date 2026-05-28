const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Carrito = sequelize.define('Carrito', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_usuario: { type: DataTypes.INTEGER, allowNull: false },
  id_producto: { type: DataTypes.INTEGER, allowNull: false },
  cantidad: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
}, {
  tableName: 'carrito',
  timestamps: false,
  indexes: [
    { unique: true, fields: ['id_usuario', 'id_producto'], name: 'uk_carrito_usuario_producto' },
  ],
});

module.exports = Carrito;
