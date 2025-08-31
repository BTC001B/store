const express = require("express");
const router = express.Router();
const recommendationController = require("../controllers/recommendationController");

// GET personalized recommendations
router.get("/recommendations/userid/:userId", recommendationController.getPersonalizedRecommendations);

module.exports = router;
