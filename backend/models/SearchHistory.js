// models/SearchHistory.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./User");

const SearchHistory = sequelize.define("SearchHistory", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id"
    }
  },
  query: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: "search_histories",
  timestamps: true
});



module.exports = SearchHistory;
