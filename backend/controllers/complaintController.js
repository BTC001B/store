// controllers/complaintController.js
const Complaint = require("../models/Complaint");
const User = require("../models/User");
const Seller = require("../models/Seller");
const Admin = require("../models/Admin");
const Product = require("../models/Product");
const Order = require("../models/Order");


// ✅ 1. Create Complaint - User against Seller
exports.createComplaintAgainstSeller = async (req, res) => {
  try {
    const { raisedByUserId, againstSellerId, orderId, productId, complaintType, description } = req.body;

    if (!raisedByUserId || !againstSellerId || !complaintType || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate foreign keys
    const user = await User.findByPk(raisedByUserId);
    if (!user) return res.status(400).json({ error: "User not found" });

    const seller = await Seller.findByPk(againstSellerId);
    if (!seller) return res.status(400).json({ error: "Seller not found" });

    if (orderId) {
      const order = await Order.findByPk(orderId);
      if (!order) return res.status(400).json({ error: "Order not found" });
    }

    if (productId) {
      const product = await Product.findByPk(productId);
      if (!product) return res.status(400).json({ error: "Product not found" });
    }

    const complaint = await Complaint.create({
      raisedByUserId,
      againstSellerId,
      orderId,
      productId,
      complaintType,
      description,
      status: "Pending",
      priority: "Medium"
    });

    res.json({ message: "Complaint created successfully", data: complaint });
  } catch (error) {
    console.error("Error in createComplaintAgainstSeller:", error);
    res.status(500).json({ error: "Server error" });
  }
};


// ✅ 2. Create Complaint - Seller against User
exports.createComplaintAgainstUser = async (req, res) => {
  try {
    const { raisedBySellerId, againstUserId, orderId, productId, complaintType, description } = req.body;

    if (!raisedBySellerId || !againstUserId || !complaintType || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate foreign keys
    const seller = await Seller.findByPk(raisedBySellerId);
    if (!seller) return res.status(400).json({ error: "Seller not found" });

    const user = await User.findByPk(againstUserId);
    if (!user) return res.status(400).json({ error: "User not found" });

    if (orderId) {
      const order = await Order.findByPk(orderId);
      if (!order) return res.status(400).json({ error: "Order not found" });
    }

    if (productId) {
      const product = await Product.findByPk(productId);
      if (!product) return res.status(400).json({ error: "Product not found" });
    }

    const complaint = await Complaint.create({
      raisedBySellerId,
      againstUserId,
      orderId,
      productId,
      complaintType,
      description,
      status: "Pending",
      priority: "Medium"
    });

    res.json({ message: "Complaint created successfully", data: complaint });
  } catch (error) {
    console.error("Error in createComplaintAgainstUser:", error);
    res.status(500).json({ error: "Server error" });
  }
};


// ✅ 3. Get Complaints by User
exports.getComplaintsByUser = async (req, res) => {
  try {
    const { userId } = req.params;  
    if (!userId) return res.status(400).json({ message: "userId is required" });

    const complaints = await Complaint.findAll({ where: { raisedByUserId: userId } });
    res.json({ data: complaints });
  } catch (error) {
    console.error("Error in getComplaintsByUser:", error);
    res.status(500).json({ message: "Error fetching complaints", error: error.message });
  }
};


// ✅ 4. Get Complaints by Seller
exports.getComplaintsBySeller = async (req, res) => {
  try {
    const { sellerId } = req.params;
    if (!sellerId) return res.status(400).json({ message: "sellerId is required" });

    const complaints = await Complaint.findAll({ where: { raisedBySellerId: sellerId } });
    res.json({ data: complaints });
  } catch (error) {
    console.error("Error in getComplaintsBySeller:", error);
    res.status(500).json({ error: "Server error" });
  }
};


// ✅ 5. Get All Complaints (Admin)
exports.getAllComplaints = async (req, res) => {
  try {
    const { status, priority } = req.query;
    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const complaints = await Complaint.findAll({
      where,
      include: [
        { model: User, as: "raisedByUser", attributes: ["id", "name", "email"] },
        { model: Seller, as: "raisedBySeller", attributes: ["id", "name"] },
        { model: User, as: "againstUser", attributes: ["id", "name", "email"] },
        { model: Seller, as: "againstSeller", attributes: ["id", "name"] },
        { model: Admin, as: "resolvedByAdmin", attributes: ["id", "fullName"] }
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({ data: complaints });
  } catch (error) {
    console.error("Error in getAllComplaints:", error);
    res.status(500).json({ error: "Server error" });
  }
};


// ✅ 6. Get Complaint by ID
exports.getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findByPk(id, {
      include: [
        { model: User, as: "raisedByUser", attributes: ["id", "name", "email"] },
        { model: Seller, as: "raisedBySeller", attributes: ["id", "name"] },
        { model: User, as: "againstUser", attributes: ["id", "name", "email"] },
        { model: Seller, as: "againstSeller", attributes: ["id", "name"] },
        { model: Product, as: "product", attributes: ["id", "name"] },
        { model: Order, as: "order", attributes: ["id", "status"] },
        { model: Admin, as: "resolvedByAdmin", attributes: ["id", "fullName"] }
      ],
    });

    if (!complaint) return res.status(404).json({ error: "Complaint not found" });
    res.json({ data: complaint });
  } catch (error) {
    console.error("Error in getComplaintById:", error);
    res.status(500).json({ error: "Server error" });
  }
};


// ✅ 7. Update Complaint Status/Priority (Admin)
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, resolvedBy } = req.body;

    const complaint = await Complaint.findByPk(id);
    if (!complaint) return res.status(404).json({ error: "Complaint not found" });

    if (status) complaint.status = status;
    if (priority) complaint.priority = priority;
    if (resolvedBy) complaint.resolvedBy = resolvedBy;

    await complaint.save();

    res.json({ message: "Complaint updated successfully", data: complaint });
  } catch (error) {
    console.error("Error in updateComplaintStatus:", error);
    res.status(500).json({ error: "Server error" });
  }
};
