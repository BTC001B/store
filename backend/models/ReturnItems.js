// models/ReturnItem.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ReturnItem = sequelize.define("ReturnItem", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  returnId: { type: DataTypes.INTEGER, allowNull: false },
  orderItemId: { type: DataTypes.INTEGER, allowNull: false },
  status: {
    type: DataTypes.ENUM("Pending", "Approved", "Rejected"),
    defaultValue: "Pending"
  }
}, {
  tableName: "return_items",
  underscored: true,
  timestamps: true
});

module.exports = ReturnItem;
