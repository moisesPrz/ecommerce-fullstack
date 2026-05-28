const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Pedido = sequelize.define('Pedido', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_usuario: { type: DataTypes.INTEGER, allowNull: false },
  id_direccion: { type: DataTypes.INTEGER, allowNull: true },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  estado: {
    type: DataTypes.ENUM('pendiente', 'procesando', 'enviado', 'entregado', 'completado', 'cancelado'),
    defaultValue: 'pendiente',
  },
  metodo_pago: {
    type: DataTypes.ENUM('stripe', 'wompi', 'efectivo', 'transferencia'),
    defaultValue: 'stripe',
  },
  referencia_wompi: { type: DataTypes.STRING(100), allowNull: true },
  stripe_payment_intent_id: { type: DataTypes.STRING(100), allowNull: true },
  direccion_envio: { type: DataTypes.STRING(255), allowNull: true },
  notas: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'pedidos',
  timestamps: true,
  underscored: true,
  paranoid: true,
  indexes: [
    { fields: ['id_usuario'], name: 'idx_pedidos_id_usuario' },
  ],
});

module.exports = Pedido;
