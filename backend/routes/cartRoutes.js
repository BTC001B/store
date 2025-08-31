const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

// 🛒 Add product to cart
router.post("/add", cartController.addToCart);

// 📦 Get all cart items for a user
router.get("/userid/:userId", cartController.getCartByUser);

// ✏️ Update quantity of a cart item
router.put("/update/cardid/:id", cartController.updateCartItem);

// ❌ Remove a single cart item
router.delete("/remove/cartid/:id", cartController.removeCartItem);

// 🗑️ Clear entire cart for a user
router.delete("/clear/userid/:userId", cartController.clearCart);

module.exports = router;
