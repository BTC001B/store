// controllers/cartController.js
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User"); // assuming User model exists

// 🛒 Add product to cart
exports.addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    // check product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // check if already in cart → update quantity
    let cartItem = await Cart.findOne({ where: { userId, productId } });

    if (cartItem) {
      cartItem.quantity += quantity;
      cartItem.price = product.price * cartItem.quantity;
      await cartItem.save();
    } else {
      cartItem = await Cart.create({
        userId,
        productId,
        quantity,
        price: product.price * quantity,
      });
    }

    res.json(cartItem);
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// 📦 Get cart items for a user
exports.getCartByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const cartItems = await Cart.findAll({
      where: { userId },
      include: [
        { model: Product, attributes: ["id", "name", "price", "image"] },
      ],
    });

    res.json(cartItems);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✏️ Update quantity of a cart item
exports.updateCartItem = async (req, res) => {
  try {
    const { id } = req.params; // cart item id
    const { quantity } = req.body;

    const cartItem = await Cart.findByPk(id);
    if (!cartItem) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    const product = await Product.findByPk(cartItem.productId);
    cartItem.quantity = quantity;
    cartItem.price = product.price * quantity;

    await cartItem.save();
    res.json(cartItem);
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ❌ Remove single cart item
exports.removeCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const cartItem = await Cart.findByPk(id);

    if (!cartItem) {
      return res.status(404).json({ error: "Cart item not found" });
    }

    await cartItem.destroy();
    res.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Error removing cart item:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// 🗑️ Clear entire cart for a user
exports.clearCart = async (req, res) => {
  try {
    const { userId } = req.params;
    await Cart.destroy({ where: { userId } });
    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ error: "Server error" });
  }
};
