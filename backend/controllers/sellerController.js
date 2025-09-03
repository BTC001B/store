const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Seller = require("../models/Seller.js");
const Product=require("../models/Product.js");
const { Op, fn, col, literal, where } = require("sequelize");
const Order =require("../models/Order.js");
const OrderItem=require("../models/OrderItem.js");
const { Sequelize } = require("../config/db.js"); 
const moment = require("moment");


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

exports.updateSeller = async(req,res)=>{
  try{
    const [profile] = await Seller.update(req.body,{where:{id:req.user.id}});

    if(profile===0){
      res.status(404).json({err:"Profile Not Found"});
      console.error();
    }

    res.json({ message: 'Profile updated successfully' });
  }catch(err)
{
      console.log(err)
      res.status(500).json({error:"Failed to Update"})
}}

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

exports.getOrderedItemsBySeller = async (req, res) => {
  try {
    const sellerId = req.user.id; // ✅ seller from auth

    const orderedItems = await OrderItem.findAll({
      include: [
        {
          model: Product,
          as: "product", 
          where: { sellerId },
          attributes: ["id", "name", "price", "sellerId"]
        },
        {
          model: Order,
          as: "order", 
          attributes: ["id", "status", "totalAmount", "createdAt", "userId"]
        }
      ],
      order: [["createdAt", "DESC"]] // latest first
    });

    res.json(orderedItems);
  } catch (err) {
    console.error("Get Ordered Items Error:", err);
    res.status(500).json({ error: "Failed to fetch ordered items" });
  }
};
exports.getDashboardofSeller = async (req, res) => {
  try {
    const sellerId = req.user.id;

    // total sales (number of order items belonging to this seller)
    const totalSales = await OrderItem.count({
      include: [
        {
          model: Product,
          as: "product",
          where: { sellerId }
        }
      ]
    });
    // total revenue = SUM(quantity * price)
    const revenueResult = await OrderItem.findOne({
      attributes: [
        [fn("SUM", literal('"OrderItem"."quantity" * "OrderItem"."price"')), "totalRevenue"]
      ],
      include: [
        {
          model: Product,
          as: "product",
          attributes: [],
          where: { sellerId }
        }
      ],
      raw: true
    });
    const totalRevenue = revenueResult?.totalRevenue ? Number(revenueResult.totalRevenue) : 0;

const todayOrderCount = await OrderItem.count({
      include: [
        {
          model: Product,
          as: "product",
          where: { sellerId }
        },
        {
          model: Order,
          as: "order",
          where: Sequelize.where(
            Sequelize.fn("DATE", Sequelize.col("order.createdAt")),
            Sequelize.fn("DATE", Sequelize.fn("NOW"))
          )
        }
      ],
      distinct: true,
      col: "orderId"
    });

    const orderStatusCounts = await Order.findAll({
      attributes: [
        "status",
        [fn("COUNT", col("Order.id")), "count"]   // ✅ disambiguated
      ],
      include: [
        {
          model: OrderItem,
          as: "items",
          attributes: [],
          include: [
            {
              model: Product,
              as: "product",
              attributes: [],
              where: { sellerId }
            }
          ]
        }
      ],
      group: ["Order.status"],
      raw: true
    });

   const totalProducts = await Product.count({
  where: { sellerId: sellerId }
});


   const lowStockProducts = await Product.findAll({
      where: {
        stock: {
          [Op.lt]: 5   // stock < 5
        }
      }
    });

      const customerCount = await Order.count({
      distinct: true,
      col: "userId", // unique customers
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              where: { sellerId: sellerId } // filter by seller
            }
          ]
        }
      ]
    });

  const rawData = await OrderItem.findAll({
      attributes: [
        [fn("DATE", col("order.createdAt")), "date"],
        [fn("SUM", col("OrderItem.quantity")), "totalSold"]
      ],
      include: [
        {
          model: Product,
          as: "product",
          attributes: [],
          where: { sellerId }
        },
        {
          model: Order,
          as: "order",
          attributes: [],
          where: {
            createdAt: {
              [Op.between]: [
                literal("CURRENT_DATE - INTERVAL '1 month'"), // last month
                literal("CURRENT_DATE") // today
              ]
            }
          }
        }
      ],
      group: [fn("DATE", col("order.createdAt"))],
      order: [[fn("DATE", col("order.createdAt")), "ASC"]],
      raw: true
    });

    // 2. Map DB result into an object for quick lookup
    const salesMap = {};
    rawData.forEach(row => {
      salesMap[moment(row.date).format("YYYY-MM-DD")] = parseInt(row.totalSold, 10);
    });

    // 3. Build full date range with 0 defaults
    const startDate = moment().subtract(1, "month").startOf("day");
    const endDate = moment().endOf("day");
    const fullData = [];

    for (let m = startDate.clone(); m.isSameOrBefore(endDate); m.add(1, "day")) {
      const formatted = m.format("YYYY-MM-DD");
      fullData.push({
        date: formatted,
        totalSold: salesMap[formatted] || 0
      });
    }




    res.json({
      TotalSales: totalSales,
      TotalRevenue: totalRevenue,
      TodayTotalOrder: todayOrderCount,
      orderStatusCount : orderStatusCounts,
      TotalProducts : totalProducts,
      LowStockProducts : lowStockProducts,
      CountOfCustomer : customerCount,
      monthlyStats: rawData
    });

  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).json({ error: "Failed to fetch data" });
  }
};







