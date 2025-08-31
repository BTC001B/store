const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Product = require('./Product');

const ProductViewHistory = sequelize.define('ProductViewHistory', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER },
  productId: { type: DataTypes.INTEGER }
}, { timestamps: true });

// Association
ProductViewHistory.belongsTo(Product, { foreignKey: 'productId' });

module.exports = ProductViewHistory;
