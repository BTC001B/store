const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Admin = sequelize.define("Admin", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  fullName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  superAdmin: { type: DataTypes.BOOLEAN, defaultValue: false }, // superAdmin vs normal admin
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  timestamps: true,
});

module.exports = Admin;
