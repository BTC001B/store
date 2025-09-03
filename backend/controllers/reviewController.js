
const User = require("../models/User");
const Review = require("../models/Review");


exports.createReview = async (req, res) => {
  try {
    const { productId, userId, rating, comment } = req.body;

    if (!productId || !userId || !rating) {
      return res.status(400).json({ error: "productId, userId, and rating are required" });
    }

    // Collect uploaded image paths (relative, not absolute)
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `/uploads/reviews/${file.filename}`);
    }

    const review = await Review.create({
      productId,
      userId,
      rating,
      comment,
      images: imageUrls // assuming `images` is a JSON/ARRAY column in Review model
    });

    res.json({ message: "Review added successfully", review });

  } catch (error) {
    console.error("Error in createReview:", error);
    res.status(500).json({ error: "Server error" });
  }
};


exports.getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.findAll({
      where: { productId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"], // only needed fields
        },
      ],
    });

    res.json({ reviews });
  } catch (error) {
    console.error("Error in getReviewsByProduct:", error);
    res.status(500).json({ error: "Server error" });
  }
};


// ✅ Get Reviews by User ID
exports.getReviewsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.findAll({
      where: { userId },
      include: [
        {
          model: User,
          as: "user", 
          attributes: ["id", "name", "email"], // only fetch what’s needed
        },
      ],
    });
    res.json(reviews);
  } catch (error) {
    console.error("Error in getReviewsByUser:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Update Review
exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findByPk(id);
    if (!review) return res.status(404).json({ error: "Review not found" });

    review.rating = rating ?? review.rating;
    review.comment = comment ?? review.comment;
    await review.save();

    res.json({ message: "Review updated successfully", review });
  } catch (error) {
    console.error("Error in updateReview:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Delete Review
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByPk(id);
    if (!review) return res.status(404).json({ error: "Review not found" });

    await review.destroy();
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Error in deleteReview:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Get Average Rating by Product ID
exports.getAverageRating = async (req, res) => {
  try {
    const { productId } = req.params;
    const result = await Review.findAll({
      where: { productId },
      attributes: [
        [Review.sequelize.fn("AVG", Review.sequelize.col("rating")), "averageRating"]
      ]
    });

    const averageRating = parseFloat(result[0].dataValues.averageRating || 0).toFixed(2);
    res.json({ productId, averageRating });
  } catch (error) {
    console.error("Error in getAverageRating:", error);
    res.status(500).json({ error: "Server error" });
  }
};
