const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const OTP = require("../models/OtpModel");
const Admin = require("../models/Admin");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const OrderItem =require("../models/OrderItem");
const Review =require("../models/Review");
const sequelize =require("../config/db");
const { Op, where } = require("sequelize");
const Seller = require("../models/Seller");

// ✅ Register Admin
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, superAdmin } = req.body;

    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) return res.status(400).json({ error: "Admin already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      fullName,
      email,
      password: hashedPassword,
      superAdmin: superAdmin || false,
    });

    res.status(201).json({ message: "Admin registered", admin });
  } catch (error) {
    console.error("Error in register:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Login Admin
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ where: { email } });
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: admin.id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Dashboard Stats
exports.getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalProducts = await Product.count();
    const totalOrders = await Order.count();

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
    });
  } catch (error) {
    console.error("Error in getDashboard:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ Manage Admins (superAdmin only)
exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll();
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.toggleAdminStatus = async (req, res) => {
  try {
    const { adminId } = req.params;
    const admin = await Admin.findByPk(adminId);

    if (!admin) return res.status(404).json({ error: "Admin not found" });

    admin.isActive = !admin.isActive;
    await admin.save();

    res.json({ message: "Admin status updated", admin });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.forgotPasswordRequestOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    // check if user exists
    const existingAdmin = await Admin.findOne({ where: { email } });
    if (!existingAdmin) {
      return res.status(404).json({ error: "No account found with this email" });
    }

    // generate OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
      digits: true,
    });

    // save or update OTP
    await OTP.upsert({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "🔐 OTP for Password Reset",
      text: `Your OTP is: ${otp}. It expires in 5 minutes.`,
    });

    res.json({ message: "✅ OTP sent for password reset" });
  } catch (error) {
    console.error("❌ Error sending forgot password OTP:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

exports.forgotPasswordVerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "Email & OTP are required" });

    const record = await OTP.findOne({ where: { email } });
    if (!record) return res.status(400).json({ error: "No OTP found. Request again." });

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ error: "OTP expired" });
    }

    if (record.otp !== parseInt(otp)) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    res.json({ message: "✅ OTP verified successfully" });
  } catch (error) {
    console.error("❌ Error verifying OTP:", error);
    res.status(500).json({ error: "OTP verification failed" });
  }
};

exports.forgotPasswordReset = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "Email, OTP, and new password are required" });
    }

    const record = await OTP.findOne({ where: { email } });
    if (!record) return res.status(400).json({ error: "No OTP found. Request again." });

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ error: "OTP expired" });
    }

    if (record.otp !== parseInt(otp)) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // update user password
    await Admin.update(
      { password: hashedPassword },
      { where: { email } }
    );

    // delete OTP after reset
    await OTP.destroy({ where: { email } });

    res.json({ message: "✅ Password reset successful" });
  } catch (error) {
    console.error("❌ Error resetting password:", error);
    res.status(500).json({ error: "Password reset failed" });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.isBlocked) {
      return res.status(400).json({ message: "User is already blocked" });
    }

    user.isBlocked = true;
    await user.save();

    res.json({ message: "User blocked successfully", user });
  } catch (error) {
    console.error("Error in blockUser:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!user.isBlocked) {
      return res.status(400).json({ message: "User is already unblocked" });
    }

    user.isBlocked = false;
    await user.save();

    res.json({ message: "User unblocked successfully", user });
  } catch (error) {
    console.error("Error in unblockUser:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// 1. Top Selling Products
exports.getTopSellingProducts = async (req, res) => {
  try {
    const topProducts = await OrderItem.findAll({
      attributes: [
        "productId",
        [Sequelize.fn("SUM", Sequelize.col("quantity")), "totalSold"],
        [Sequelize.fn("SUM", Sequelize.col("price")), "totalRevenue"],
      ],
      include: [{ model: Product, attributes: ["id", "name", "image"] }],
      group: ["productId", "Product.id"],
      order: [[Sequelize.literal("totalSold"), "DESC"]],
      limit: 10,
    });

    res.json(topProducts);
  } catch (error) {
    console.error("Error in getTopSellingProducts:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// 2. Low Stock Products
exports.getLowStockProducts = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;

    const products = await Product.findAll({
      where: { stock: { [Op.lte]: threshold } },
      attributes: ["id", "name", "stock"],
      order: [["stock", "ASC"]],
    });

    res.json(products);
  } catch (error) {
    console.error("Error in getLowStockProducts:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// 3. Revenue Trends (Monthly)
exports.getRevenueTrends = async (req, res) => {
  try {
    const trends = await Order.findAll({
      attributes: [
        [Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("createdAt")), "month"],
        [Sequelize.fn("SUM", Sequelize.col("totalAmount")), "revenue"],
      ],
      group: [Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("createdAt"))],
      order: [[Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("createdAt")), "ASC"]],
    });

    res.json(trends);
  } catch (error) {
    console.error("Error in getRevenueTrends:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// 4. Product Ratings & Reviews
exports.getProductRatings = async (req, res) => {
  try {
    const ratings = await Review.findAll({
      attributes: [
        "productId",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "reviewCount"],
        [Sequelize.fn("AVG", Sequelize.col("rating")), "avgRating"],
      ],
      include: [{ model: Product, attributes: ["id", "name"] }],
      group: ["productId", "Product.id"],
      order: [[Sequelize.literal("avgRating"), "DESC"]],
    });

    res.json(ratings);
  } catch (error) {
    console.error("Error in getProductRatings:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// 5. Category Performance
exports.getCategoryPerformance = async (req, res) => {
  try {
    const categories = await OrderItem.findAll({
      attributes: [
        [Sequelize.col("Product.category"), "category"],
        [Sequelize.fn("SUM", Sequelize.col("quantity")), "totalSold"],
        [Sequelize.fn("SUM", Sequelize.col("price")), "totalRevenue"],
      ],
      include: [{ model: Product, attributes: [] }],
      group: ["Product.category"],
      order: [[Sequelize.literal("totalRevenue"), "DESC"]],
    });

    res.json(categories);
  } catch (error) {
    console.error("Error in getCategoryPerformance:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.giveAccesstoSeller = async (req,res) => {
  try{
    const {sellerId} = req.params;
    const seller = await Seller.findByPk(sellerId);
    if (!seller){
      return res.status(404).json({error: "Seller Not Found"});
    }
    if(seller.isActive){
      return res.status(400).json({error:"Already Access Given"});
    }
    seller.isActive=true;
    await seller.save();
    res.json({message:"Access has been Given"})

  }catch{
    console.error();
    res.status(500).json("Error Founded, Failed to Give Access");
  }
};

exports.getProductsBySellerId = async (req, res) => {
  try {
    const { sellerId } = req.params;


    if (!sellerId) {
      return res.status(400).json({ error: "Seller ID is required" });
    }

    const products = await Product.findAll({
      where: { sellerId }
    });

    if (!products || products.length === 0) {
      return res.status(404).json({ error: "No products found for this seller" });
    }

    res.json(products);
  } catch (err) {
    console.error("Error in getProductsBySellerId:", err);
    res.status(500).json({ error: "Error fetching products" });
  }
};
