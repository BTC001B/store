require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ,
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: false, // set true to see SQL queries
  }
);

sequelize.authenticate()
  .then(() => console.log('✅ PostgreSQL connected'))
  .catch(err => console.error('❌ DB connection failed:', err.message));

module.exports = sequelize;
