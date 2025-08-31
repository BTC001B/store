const sequelize =require("../config/db");
const { DataTypes } = require("sequelize");

const OrderItem = sequelize.define("OrderItem", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  orderId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false }, // snapshot of product price at purchase
  totalPrice: { type: DataTypes.FLOAT, allowNull: false }
}, {
  timestamps: true,
  tableName: "order_items"
});

module.exports=OrderItem;