const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Direccion = sequelize.define('Direccion', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_usuario: { type: DataTypes.INTEGER, allowNull: false },
  nombre_destinatario: { type: DataTypes.STRING(100), allowNull: false },
  direccion: { type: DataTypes.STRING(255), allowNull: false },
  ciudad: { type: DataTypes.STRING(100), allowNull: false },
  departamento: { type: DataTypes.STRING(100), allowNull: false },
  codigo_postal: { type: DataTypes.STRING(20), allowNull: true },
  telefono: { type: DataTypes.STRING(20), allowNull: true },
  is_principal: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'direcciones',
  timestamps: false,
  indexes: [
    { fields: ['id_usuario'], name: 'idx_direcciones_id_usuario' },
  ],
});

module.exports = Direccion;
