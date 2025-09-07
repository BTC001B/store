const sequelize = require("./config/db"); // Sequelize config
const dotenv = require("dotenv");
const cors = require('cors');
const express = require("express");
const User =require("./models/User");
const Cart =require("./models/Cart");
const Order =require("./models/Order");
const OrderItem =require("./models/OrderItem");
const Product =require("./models/Product");
const Wishlist=require("./models/Wishlist");
const ProductViewHistory=require("./models/ProductViewHistory");
const Brand = require("./models/Brand");
const Review=require("./models/Review");
const Profile = require("./models/Profile");
const SearchHistory=require("./models/SearchHistory");
const Seller=require("./models/Seller");
const Complaint=require("./models/Complaint");
const Admin=require("./models/Admin");
const Return=require("./models/Return")
const ReturnItem=require("./models/ReturnItems");
const authRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const orderRoutes = require("./routes/orderRoutes");
const brandRoutes =require("./routes/brandRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const addressRoutes = require("./routes/addressRoutes");
const profileRoutes=require("./routes/profileRoutes");
const adminRoutes = require("./routes/adminRoutes");
const searchRoutes=require("./routes/searchRoutes");
const sellerRoutes = require("./routes/sellerRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const returnRoutes =require("./routes/returnRoutes");



dotenv.config();
const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json()); // handles JSON bodies
app.use(express.urlencoded({ extended: true })); // handles form submissions

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/product",productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist",wishlistRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/brand",brandRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/address",addressRoutes);
app.use("/api/profile",profileRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/searchbar",searchRoutes);
app.use("/api/seller",sellerRoutes);
app.use("/api/complaint",complaintRoutes);
app.use("/api/return",returnRoutes);
app.use("/uploads", express.static("uploads"));




User.hasMany(Cart, { foreignKey: "userId", as: "carts" });
Cart.belongsTo(User, { foreignKey: "userId", as: "user" });

Product.hasMany(Cart, { foreignKey: "productId", as: "carts" });
Cart.belongsTo(Product, { foreignKey: "productId", as: "product" });

Wishlist.belongsTo(Product, { foreignKey: "productId", as: "product" });
Product.hasMany(Wishlist, { foreignKey: "productId", as: "wishlists" });

User.hasMany(Order, { foreignKey: "userId", as: "orders" });
Order.belongsTo(User, { foreignKey: "userId", as: "user" });

Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "orderId", as: "order" });

Product.hasMany(OrderItem, { foreignKey: "productId", as: "orderItems" });
OrderItem.belongsTo(Product, { foreignKey: "productId", as: "product" });

ProductViewHistory.belongsTo(Product, { foreignKey: "productId", as: "product" });
Product.hasMany(ProductViewHistory, { foreignKey: "productId", as: "views" });

Brand.hasMany(Product, { foreignKey: "brandId", as: "products" });
Product.belongsTo(Brand, { foreignKey: "brandId", as: "brands" });

Review.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Review, { foreignKey: "userId", as: "reviews" });

User.hasOne(Profile, { foreignKey: "userId", as: "profile", onDelete: "CASCADE" });
Profile.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(SearchHistory, { foreignKey: "userId", as: "searchHistories" });
SearchHistory.belongsTo(User, { foreignKey: "userId", as: "user" });

Seller.hasMany(Brand, { foreignKey: "sellerId", });
Brand.belongsTo(Seller, { foreignKey: "sellerId" });

Complaint.belongsTo(User, { foreignKey: "raisedByUserId", as: "raisedByUser" });
Complaint.belongsTo(Seller, { foreignKey: "raisedBySellerId", as: "raisedBySeller" });

// Complaint against
Complaint.belongsTo(User, { foreignKey: "againstUserId", as: "againstUser" });
Complaint.belongsTo(Seller, { foreignKey: "againstSellerId", as: "againstSeller" });

// Related entities
Complaint.belongsTo(Product, { foreignKey: "productId", as: "product" });
Complaint.belongsTo(Order, { foreignKey: "orderId", as: "order" });

// User ↔ Return
User.hasMany(Return, { foreignKey: "userId", as: "returns" });
Return.belongsTo(User, { foreignKey: "userId", as: "user" });

// Order ↔ Return
Order.hasMany(Return, { foreignKey: "orderId", as: "returns" });
Return.belongsTo(Order, { foreignKey: "orderId", as: "order" });

// Return ↔ ReturnItem
Return.hasMany(ReturnItem, { foreignKey: "returnId", as: "items" });
ReturnItem.belongsTo(Return, { foreignKey: "returnId", as: "return" });

// OrderItem ↔ ReturnItem
OrderItem.hasMany(ReturnItem, { foreignKey: "orderItemId", as: "returnItems" });
ReturnItem.belongsTo(OrderItem, { foreignKey: "orderItemId", as: "orderItem" });

// Resolved by Admin
Complaint.belongsTo(Admin, { foreignKey: "resolvedBy", as: "resolvedByAdmin" });


// Root
app.get("/", (req, res) => {
  res.send("🚀 Server is running...");
});

// Sync DB and Start server
const PORT = process.env.PORT || 5000;
sequelize
  .sync({force:true})
  .then(() => {
    console.log("✅ Database connected & synced");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err);
  });   
