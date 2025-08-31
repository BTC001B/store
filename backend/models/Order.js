const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: { // who placed the order
    type: DataTypes.INTEGER,
    allowNull: false
  },
  totalAmount: { // total price of the order
    type: DataTypes.FLOAT,
    allowNull: false
  },
  discount: { // discount if applied
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  finalAmount: { // total - discount
    type: DataTypes.FLOAT,
    allowNull: false
  },
  status: { // order lifecycle
    type: DataTypes.ENUM("Pending", "Processing", "Shipped", "Delivered", "Cancelled"),
    defaultValue: "Pending"
  },
  paymentStatus: {
    type: DataTypes.ENUM("Pending", "Paid", "Failed", "Refunded"),
    defaultValue: "Pending"
  },
  paymentMethod: {
    type: DataTypes.ENUM("COD", "CreditCard", "UPI", "PayPal"),
    defaultValue: "COD"
  },
  shippingAddress: { type: DataTypes.JSONB, allowNull: false }, // store full address as JSON
  createdBy: { type: DataTypes.STRING, defaultValue: "User" }
}, {
  timestamps: true,
  tableName: "orders"
});

module.exports = Order;
