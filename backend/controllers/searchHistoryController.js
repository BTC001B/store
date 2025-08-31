// controllers/searchController.js
const Product = require("../models/Product");
const SearchHistory = require("../models/SearchHistory");
const { Op } = require("sequelize");

// 🔍 Search Products
// 🔍 Search Products + Save History
exports.searchProducts = async (req, res) => {
  try {
    const { q, userId } = req.query; // get from query params


    if (!q) return res.status(400).json({ error: "Search query required" });

    // Search products
    const products = await Product.findAll({
      where: {
        name: { [Op.iLike]: `%${q}%` }
      }
    });

    // Save search history only if userId is provided
    if (userId) {
      await SearchHistory.create({
        userId,
        query: q
      });
    }

    res.json({ results: products });
  } catch (error) {
    console.error("Error in searchProducts:", error);
    res.status(500).json({ error: "Server error" });
  }
};


// 📜 Get User Search History
exports.getSearchHistory = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });

    const history = await SearchHistory.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      limit: 10
    });

    res.json({ history });
  } catch (error) {
    console.error("Error in getSearchHistory:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// 💡 Suggestions
exports.getSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "query required" });

    const suggestions = await Product.findAll({
      attributes: ["id", "name", "slug"],
      where: {
        name: { [Op.iLike]: `${q}%` }
      },
      limit: 5
    });

    res.json({ suggestions });
  } catch (error) {
    console.error("Error in getSuggestions:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteSearchHistory = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId required" });

    const deleted = await SearchHistory.destroy({ where: { userId } });

    res.json({ message: `Deleted ${deleted} search history records` });
  } catch (error) {
    console.error("Error in deleteSearchHistory:", error);
    res.status(500).json({ error: "Server error" });
  }
};


exports.deleteSearchHistoryById = async (req, res) => {
  try {
    const { id } = req.query; // search history record ID
    const { userId } = req.query;

    if (!id || !userId) return res.status(400).json({ error: "id and userId required" });

    const deleted = await SearchHistory.destroy({ where: { id, userId } });

    if (!deleted) return res.status(404).json({ error: "Search history record not found" });

    res.json({ message: "Search history record deleted successfully" });
  } catch (error) {
    console.error("Error in deleteSearchHistoryById:", error);
    res.status(500).json({ error: "Server error" });
  }
};