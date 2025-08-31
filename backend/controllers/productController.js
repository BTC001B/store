const Product = require('../models/Product');
const ProductViewHistory = require('../models/ProductViewHistory');
const { Op } = require("sequelize");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");



// ➕ Create Product
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.bulkCreate(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 📦 Get All Products (public)
exports.getAllProducts = async (req, res) => {
  try {
      const { mode } = req.query;
      // mode = all | byDiscount | highestDiscount

      let whereClause = { isDeleted: false };
      let order = [["createdAt", "DESC"]];
      let limit;

      if (mode === "byDiscount") {
        // Sort all products by discount value (highest first)
        order = [["discount", "DESC"]];
      }

      if (mode === "highestDiscount") {
        // Get only the single highest discounted product
        order = [["discount", "DESC"]];
        limit = 5;
      }

      const products = await Product.findAll({
        where: whereClause,
        order,
        limit
      });

      res.json(products);
    } catch (err) {
      console.error("Error fetching products:", err);
      res.status(500).json({ error: err.message });
    }
  };


exports.getProductById = async (req, res) => {
  // const { productId } = req.params;
  let { userId } = req.query; // optional: pass userId to track
  let { productId } = req.params; // ← allow reassignment
  productId = parseInt(productId);
  if (isNaN(productId)) {
    return res.status(400).json({ message: "Invalid productId" });
  }

  try {
    // productId = parseInt(productId);
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({ data: productId, message: 'Product not found' });
    }

    // ✅ Track view if userId is provided
    if (userId) {
      userId = parseInt(userId); // Convert to integer
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid userId' });
      }

      await ProductViewHistory.create({ userId, productId });
      await Product.increment('viewCount', { where: { id: productId } });
    }

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching product', error: err.message });
  }
};


// ✏️ Update Product
exports.updateProduct = async (req, res) => {
  try {
    const updated = await Product.update(req.body, {
      where: { id: req.params.id }
    });

    if (updated[0] === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ❌ Soft Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const updated = await Product.update({ isDeleted: true }, {
      where: { id: req.params.id }
    });

    if (updated[0] === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product soft-deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 📈 Get Best Selling Products
exports.getBestSellingProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { isDeleted: false },
      order: [['soldCount', 'DESC']],
      limit: 10
    });

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 👁️ Get Most Viewed Products
exports.getMostViewedProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { isDeleted: false },
      order: [['viewCount', 'DESC']],
      limit: 10
    });

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 👤 Get All Products by Admin ID
exports.getProductsByAdminId = async (req, res) => {
  try {
    const { adminId } = req.params;

    const products = await Product.findAll({
      where: {
        createdBy: adminId,
        isDeleted: false
      },
      order: [['createdAt', 'DESC']]
    });

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get recently viewed products by user
exports.getRecentlyViewedByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const history = await ProductViewHistory.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 10,
      include: [Product]
    });

    res.json(history.map(entry => entry.Product));
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve recent views', details: err });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Category, attributes: ['id', 'name', 'slug'] },
        { model: SubCategory, attributes: ['id', 'name', 'slug'] }
      ]
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.query; // e.g. /api/product/category/filter?category=Mobiles

    if (!category) {
      return res.status(400).json({ error: "Category is required" });
    }

    const products = await Product.findAll({
      where: {
        category: { [Op.iLike]: category }, // case-insensitive match
        isDeleted: false
      }
    });

    res.json(products);
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getProductsBySubCategory = async (req, res) => {
  try {
    const { subcategory } = req.query; // e.g. /api/products/subcategory/iPhone

    if (!subcategory) {
      return res.status(400).json({ error: "Subcategory is required" });
    }

    const products = await Product.findAll({
      where: {
        subcategory: { [Op.iLike]: subcategory }, // case-insensitive match
        isDeleted: false
      }
    });

    res.json(products);
  } catch (error) {
    console.error("Error fetching products by subcategory:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// 📌 Get Newly Added Products
exports.getNewlyAddedProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { isDeleted: false },
      order: [["createdAt", "DESC"]], // newest first
      limit: 10 // show only latest 10
    });

    res.json(products);
  } catch (error) {
    console.error("Error fetching newly added products:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getTopRatedBySubCategory = async (req, res) => {
  try {
    const { subcategory } = req.query; // e.g. /api/products/top-rated?subcategory=iPhone

    if (!subcategory) {
      return res.status(400).json({ error: "Subcategory is required" });
    }

    const products = await Product.findAll({
      where: {
        subcategory: { [Op.iLike]: subcategory }, // case-insensitive
        isDeleted: false
      },
      order: [["rating", "DESC"]], // highest rating first
      limit: 5 // adjust number of results
    });

    res.json(products);
  } catch (error) {
    console.error("Error fetching top-rated products by subcategory:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getSimilarProducts = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product || !product.tagline) {
      return res.status(404).json({ error: "Product or tags not found" });
    }

    // 🔹 Find products sharing at least one tag
    const similar = await Product.findAll({
      where: {
        id: { [Op.ne]: id }, // exclude current product
        tagline: {
          [Op.overlap]: product.tagline // Postgres only
        }
      },
      limit: 5
    });

    res.json(similar);
  } catch (error) {
    console.error("Error fetching similar products:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getLastPurchasedProducts = async (req, res) => {
  try {
    const { userId } = req.params;

    const lastOrder = await Order.findOne({
      where: { userId },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: OrderItem,
          as: "items", // 👈 use the same alias you defined in associations
          include: [{ model: Product, as: "product" }] // also use alias if defined
        }
      ]
    });

    if (!lastOrder) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    const lastPurchasedProducts = lastOrder.items.map(item => item.product);

    res.json({ buyAgain: lastPurchasedProducts });

  } catch (error) {
    console.error("Error fetching last purchased products:", error);
    res.status(500).json({ error: "Server error" });
  }
};
