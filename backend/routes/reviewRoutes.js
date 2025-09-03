const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const upload = require("../middleware/upload");

// Post a Review
router.post("/",upload.array("images", 5), reviewController.createReview);

// Get Reviews by Product ID
router.get("/product/:productId", reviewController.getReviewsByProduct);

// Get Reviews by User ID
router.get("/user/:userId", reviewController.getReviewsByUser);

// Update Review
router.put("/:id", reviewController.updateReview);

// Delete Review
router.delete("/:id", reviewController.deleteReview);

// Get Average Rating by Product ID
router.get("/product/:productId/average", reviewController.getAverageRating);

module.exports = router;
