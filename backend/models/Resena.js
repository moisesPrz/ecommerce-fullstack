const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Resena = sequelize.define('Resena', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_usuario: { type: DataTypes.INTEGER, allowNull: false },
  id_producto: { type: DataTypes.INTEGER, allowNull: false },
  id_pedido: { type: DataTypes.INTEGER, allowNull: true },
  calificacion: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  comentario: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'resenas',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['id_producto'], name: 'idx_resenas_id_producto' },
    { fields: ['id_usuario'], name: 'idx_resenas_id_usuario' },
    { unique: true, fields: ['id_usuario', 'id_producto'], name: 'idx_resenas_uq_usuario_producto' },
  ],
});

module.exports = Resena;
