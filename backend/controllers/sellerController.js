const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Seller = require("../models/Seller.js");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// 📌 Register Seller
exports.registerSeller = async (req, res) => {
  try {
    const { name, email, phone, password, businessName } = req.body;

    // Check if email already exists
    const existing = await Seller.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const seller = await Seller.create({
      name,
      email,
      phone,
      password: hashedPassword,
      businessName,
    });

    return res.status(201).json({
      message: "Seller registered successfully",
      seller: {
        id: seller.id,
        name: seller.name,
        email: seller.email,
        phone: seller.phone,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// 📌 Login Seller
exports.loginSeller = async (req, res) => {
  try {
    const { email, password } = req.body;

    const seller = await Seller.findOne({ where: { email } });
    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    if(!seller.isActive){
      return res.status(404).json({ message: "Seller doesn't Access, Contact Admin" });
    }

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: seller.id, role: "seller" }, JWT_SECRET, {
      expiresIn: "1d",
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      seller: {
        id: seller.id,
        name: seller.name,
        email: seller.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// 📌 Get Seller Profile (Protected)
exports.getSellerProfile = async (req, res) => {
  try {
    const sellerId = req.user.id; // populated from middleware
    const seller = await Seller.findByPk(sellerId, {
      attributes: { exclude: ["password"] },
    });

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    return res.status(200).json(seller);
  } catch (error) {
    console.error("Profile Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
exports.getAllSellers = async (req, res) => {
  try {
    const { status, kycStatus, page = 1, limit = 10 } = req.query;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (kycStatus) whereClause.kycStatus = kycStatus;

    const offset = (page - 1) * limit;

    const sellers = await Seller.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      total: sellers.count,
      page: parseInt(page),
      totalPages: Math.ceil(sellers.count / limit),
      data: sellers.rows,
    });
  } catch (error) {
    console.error("Error fetching sellers:", error);
    res.status(500).json({ error: "Server error fetching sellers" });
  }
};

// ✅ Get seller by ID
exports.getSellerById = async (req, res) => {
  try {
    const { id } = req.params;

    const seller = await Seller.findByPk(id);

    if (!seller) {
      return res.status(404).json({ error: "Seller not found" });
    }

    res.status(200).json(seller);
  } catch (error) {
    console.error("Error fetching seller:", error);
    res.status(500).json({ error: "Server error fetching seller" });
  }
};

// ✅ Block / Unblock seller
exports.blockUnblockSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const { isBlocked, blockReason } = req.body;

    const seller = await Seller.findByPk(id);

    if (!seller) {
      return res.status(404).json({ error: "Seller not found" });
    }

    seller.isBlocked = isBlocked;
    seller.blockReason = isBlocked ? blockReason || "Blocked by admin" : null;
    await seller.save();

    res.status(200).json({
      message: isBlocked ? "Seller blocked successfully" : "Seller unblocked successfully",
      seller,
    });
  } catch (error) {
    console.error("Error blocking/unblocking seller:", error);
    res.status(500).json({ error: "Server error updating seller block status" });
  }
};

// ✅ Delete seller
exports.deleteSeller = async (req, res) => {
  try {
    const { id } = req.params;

    const seller = await Seller.findByPk(id);

    if (!seller) {
      return res.status(404).json({ error: "Seller not found" });
    }

    await seller.destroy();

    res.status(200).json({ message: "Seller deleted successfully" });
  } catch (error) {
    console.error("Error deleting seller:", error);
    res.status(500).json({ error: "Server error deleting seller" });
  }
};
