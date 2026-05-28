const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Transaccion = sequelize.define('Transaccion', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_pedido: { type: DataTypes.INTEGER, allowNull: false },
  id_usuario: { type: DataTypes.INTEGER, allowNull: false },
  pasarela: { type: DataTypes.ENUM('stripe', 'wompi'), allowNull: false },
  referencia: { type: DataTypes.STRING(100), allowNull: false },
  estado: {
    type: DataTypes.ENUM('pendiente', 'aprobada', 'rechazada', 'reembolsada'),
    defaultValue: 'pendiente',
  },
  monto: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  moneda: { type: DataTypes.STRING(3), defaultValue: 'COP' },
  metadata: { type: DataTypes.JSON, allowNull: true },
}, {
  tableName: 'transacciones',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['id_pedido'], name: 'idx_transacciones_id_pedido' },
    { fields: ['id_usuario'], name: 'idx_transacciones_id_usuario' },
  ],
});

module.exports = Transaccion;
