const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Return = sequelize.define("Return", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  orderItemId: {  // 🔹 link directly to one product in order_items
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "order_items", // ✅ FK to order_items
      key: "id"
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users", // ✅ FK to users
      key: "id"
    }
  },
  status: {
    type: DataTypes.ENUM("Pending", "Approved", "Rejected", "Completed"),
    defaultValue: "Pending"
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: "returns",
  underscored: true
});

module.exports = Return;
