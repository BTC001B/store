// models/Seller.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Seller = sequelize.define("Seller", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement:true,
    primaryKey: true,
    allowNull:false
  },

  // Basic Info
  name: { type: DataTypes.STRING, allowNull: false },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },
  phone: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },

  // Business Details
  businessName: { type: DataTypes.STRING, allowNull: false },
  businessType: {
    type: DataTypes.ENUM("individual", "company"),
    defaultValue: "individual",
  },
  gstNumber: { type: DataTypes.STRING },
  panNumber: { type: DataTypes.STRING },

  // Address & Contact
  address: { type: DataTypes.STRING },
  city: { type: DataTypes.STRING },
  state: { type: DataTypes.STRING },
  country: { type: DataTypes.STRING },
  pincode: { type: DataTypes.STRING },

  // Bank & Payments
  bankAccountNumber: { type: DataTypes.STRING },
  bankName: { type: DataTypes.STRING },
  ifscCode: { type: DataTypes.STRING },
  upiId: { type: DataTypes.STRING },
  paymentStatus: {
    type: DataTypes.ENUM("pending", "verified"),
    defaultValue: "pending",
  },

  // Verification
  kycStatus: {
    type: DataTypes.ENUM("pending", "approved", "rejected"),
    defaultValue: "pending",
  },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  documents: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },

  // Performance & Settings
  rating: { type: DataTypes.FLOAT, defaultValue: 0 },
  totalSales: { type: DataTypes.FLOAT, defaultValue: 0 },
  status: {
    type: DataTypes.ENUM("active", "suspended", "banned"),
    defaultValue: "active",
  },
  isBlocked: { type: DataTypes.BOOLEAN, defaultValue: false },
  blockReason: { type: DataTypes.STRING },
  isActive:{type: DataTypes.BOOLEAN, defaultValue: false}
}, {
  timestamps: true,
  tableName: "sellers",
});

module.exports = Seller;
