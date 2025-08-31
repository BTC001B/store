// controllers/wishlistController.js

const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");  // to include product details

// 📌 Add product to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ error: "userId and productId are required" });
    }

    // check if already in wishlist
    const existing = await Wishlist.findOne({ where: { userId, productId } });
    if (existing) {
      return res.status(400).json({ message: "Product already in wishlist" });
    }

    const wishlistItem = await Wishlist.create({ userId, productId });
    res.status(201).json(wishlistItem);
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// 📌 Get wishlist for a user (with product details)
exports.getWishlist = async (req, res) => {
  try {
    const { userId } = req.params;

    const wishlist = await Wishlist.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          as:"product",
          attributes: ["id", "name", "price", "image", "slug", "category", "subcategory"]
        }
      ]
    });

    res.json(wishlist);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// 📌 Remove a product from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const deleted = await Wishlist.destroy({ where: { userId, productId } });

    if (!deleted) {
      return res.status(404).json({ message: "Product not found in wishlist" });
    }

    res.json({ message: "Product removed from wishlist" });
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// 📌 Clear wishlist for a user
exports.clearWishlist = async (req, res) => {
  try {
    const { userId } = req.params;

    await Wishlist.destroy({ where: { userId } });
    res.json({ message: "Wishlist cleared" });
  } catch (error) {
    console.error("Error clearing wishlist:", error);
    res.status(500).json({ error: "Server error" });
  }
};
