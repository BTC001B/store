const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Complaint = sequelize.define("Complaint", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  // Who raised the complaint (user or seller)
  raisedByUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "users",
      key: "id",
    },
  },
  raisedBySellerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "sellers",
      key: "id",
    },
  },

  // Complaint against whom (user, seller, product, or order)
  againstUserId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "users",
      key: "id",
    },
  },
  againstSellerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "sellers",
      key: "id",
    },
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "products",
      key: "id",
    },
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "orders",
      key: "id",
    },
  },

  // Complaint details
  complaintType: {
    type: DataTypes.ENUM(
      "Fraud",
      "Counterfeit",
      "Payment",
      "Harassment",
      "PolicyViolation",
      "Other"
    ),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  // Status workflow
  status: {
    type: DataTypes.ENUM("Pending", "In Review", "Resolved", "Rejected", "Escalated"),
    defaultValue: "Pending",
  },
  priority: {
    type: DataTypes.ENUM("Low", "Medium", "High", "Critical"),
    defaultValue: "Medium",
  },

  // Resolution info
  resolvedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "Admin",
      key: "id",
    },
  },
  resolutionNote: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  timestamps: true,
  tableName: "complaints",
});

module.exports = Complaint;
