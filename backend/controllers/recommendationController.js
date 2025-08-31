const Product = require("../models/Product");
const Wishlist = require("../models/Wishlist");
const ProductViewHistory = require("../models/ProductViewHistory");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");

exports.getPersonalizedRecommendations = async (req, res) => {
  try {
    const { userId } = req.params;

    let recommendations = [];

    // 1️⃣ Wishlist-based recommendations
    const wishlist = await Wishlist.findAll({
      where: { userId },
      include: [{ model: Product, as: "product" }]
    });

    if (wishlist.length) {
      const categories = wishlist.map(item => item.product.category);
      const related = await Product.findAll({
        where: { category: categories },
        limit: 5
      });
      recommendations.push(...related);
    }

    // 2️⃣ Recently Viewed (ProductViewHistory)
    const views = await ProductViewHistory.findAll({
      where: { userId },
      include: [{ model: Product, as: "product" }],
      order: [["createdAt", "DESC"]],
      limit: 5
    });

    if (views.length) {
      const categories = views.map(v => v.product.category);
      const viewedRelated = await Product.findAll({
        where: { category: categories },
        limit: 5
      });
      recommendations.push(...viewedRelated);
    }

    // 3️⃣ Past Orders
    const pastOrders = await Order.findAll({
      where: { userId },
      include: [{ model: OrderItem, as: "items", include: [{ model: Product, as: "product" }] }]
    });

    let purchasedCategories = [];
    pastOrders.forEach(o =>
      o.items.forEach(i => purchasedCategories.push(i.product.category))
    );

    if (purchasedCategories.length) {
      const related = await Product.findAll({
        where: { category: purchasedCategories },
        limit: 5
      });
      recommendations.push(...related);
    }

    // 4️⃣ Remove duplicates
    const uniqueRecommendations = recommendations.filter(
      (p, index, self) => index === self.findIndex(t => t.id === p.id)
    );

    // 5️⃣ Fallback → Top Selling
    if (!uniqueRecommendations.length) {
      const topProducts = await Product.findAll({
        limit: 5,
        order: [["soldCount", "DESC"]]
      });
      return res.json({ recommended: topProducts });
    }

    res.json({ recommended: uniqueRecommendations });

  } catch (error) {
    console.error("Recommendation Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};
