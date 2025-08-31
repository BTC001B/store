// models/Cart.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User"); // assuming you have a User model
const Product = require("./Product");

const Cart = sequelize.define(
  "Cart",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "cart",
  }
);

// Associations
Cart.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });
Cart.belongsTo(Product, { foreignKey: "productId", onDelete: "CASCADE" });

module.exports = Cart;
