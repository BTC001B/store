// models/Product.js

const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  name: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING, allowNull: false, unique: true },
  shortDescription: { type: DataTypes.STRING, allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  image: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  stock: { type: DataTypes.INTEGER, allowNull: false },
  sku: { type: DataTypes.STRING, allowNull: true, unique: true },
   tagline: { 
    type: DataTypes.ARRAY(DataTypes.STRING), // Postgres
    allowNull: true
  },
  category: { type: DataTypes.STRING, allowNull: false },
  brandId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Brands', // must match table name in Brand model
      key: 'id'
    }
  }
,
  subcategory: { type: DataTypes.STRING, allowNull: true },
  discount:{type:DataTypes.INTEGER,defaultValue:0},
  isAvailable: { type: DataTypes.BOOLEAN, defaultValue: true },
  viewCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  soldCount: { type: DataTypes.INTEGER, defaultValue: 0 },
  averageRating: { type: DataTypes.FLOAT, defaultValue: 0 },
  isFeatured: { type: DataTypes.BOOLEAN, defaultValue: false },
  isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
  createdBy: { type: DataTypes.STRING, allowNull: true }

}, {
  timestamps: true,
  tableName: 'products'
});

module.exports = Product;
