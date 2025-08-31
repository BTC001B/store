const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const OTP = sequelize.define("OTP", {
  email: { type: DataTypes.STRING, allowNull: false },
  otp: { type: DataTypes.INTEGER, allowNull: false },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
});

module.exports = OTP;
