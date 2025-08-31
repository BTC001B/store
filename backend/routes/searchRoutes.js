// routes/searchRoutes.js
const express = require("express");
const router = express.Router();
const searchController = require("../controllers/searchHistoryController");

// GET: Search products
router.get("/products", searchController.searchProducts);

// POST: Save user search history
router.post("/history", searchController.getSearchHistory); // to fetch


// GET: Search suggestions
router.get("/suggestions", searchController.getSuggestions);

router.delete("/history",searchController.deleteSearchHistory);

router.delete("/historybyid",searchController.deleteSearchHistoryById);
module.exports = router;
