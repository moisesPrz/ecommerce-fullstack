// ARCHIVO: backend/config/database.js
const { Sequelize } = require('sequelize');
const logger = require('./logger');
require('dotenv').config();

let sequelize;

// CASO 1: Estamos en la Nube (Railway, Render, etc.)
// Si existe una variable DATABASE_URL, usamos esa conexión mágica
if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'mysql',
        logging: false, // Para que no llene la consola de texto
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false // Necesario para algunas nubes
            }
        }
    });
} 
// CASO 2: Estamos en tu Computadora (Localhost)
else {
    sequelize = new Sequelize(
        process.env.DB_NAME || 'ecommerce_db',
        process.env.DB_USER || 'root',
        process.env.DB_PASSWORD || '', 
        {
            host: process.env.DB_HOST || 'localhost',
            dialect: 'mysql',
            logging: false
        }
    );
}

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Conexión a la Base de Datos exitosa');
    } catch (error) {
        logger.error('Error conectando a la Base de Datos', { error: error.message });
    }
};

module.exports = { sequelize, connectDB };