// models/Profile.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Profile = sequelize.define("Profile", {

  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM("Male", "Female", "Other"),
    allowNull: true
  },
  dob: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  altPhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  addressesCount: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  primeMembership: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  loyaltyPoints: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  preferences: {
    type: DataTypes.JSONB, // PostgreSQL JSONB type
    allowNull: true,
    defaultValue: {}
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  },
  kycVerified: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  gstNumber: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: "profiles",
  timestamps: true
});

module.exports = Profile;
