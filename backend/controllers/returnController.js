const Return = require("../models/Return");
const ReturnItem = require("../models/ReturnItems");
const Order = require("../models/Order");
const OrderItem = require("../models/OrderItem");
const User = require("../models/User");


exports.createReturn = async (req, res) => {
  try {
    const { orderId, userId, orderItemId, reason } = req.body;

    if (!orderId || !userId || !orderItemId) {
      return res.status(400).json({ error: "orderId, userId, and orderItemId are required" });
    }

    // 1️⃣ Validate orderItem exists
    const orderItem = await OrderItem.findByPk(orderItemId);
    if (!orderItem) {
      return res.status(404).json({ error: "Order item not found" });
    }
    const order = await Order.findByPk(orderId);
if (!order) {
  return res.status(404).json({ error: "Order not found" });
}

    // 2️⃣ Create return request
    const returnReq = await Return.create({ orderId, userId, reason, orderItemId });

    // 3️⃣ Create return item linked to return
    const returnItem = await ReturnItem.create({
      returnId: returnReq.id,
      orderItemId,
      status: "Pending"
    });

    res.status(201).json({
      message: "Return request created successfully",
      return: returnReq,
      item: returnItem
    });
  } catch (error) {
    console.log(req.body);
    console.error("Create Return Error:", error);
    res.status(500).json({ error: error.message });
  }
};


// 2️⃣ Get All Returns (Admin/User)
exports.getReturnsById = async (req, res) => {
  try {
    const { userId } = req.query;

    const whereCondition = userId ? { userId } : {};

    const returns = await Return.findAll({
      where: whereCondition
    });

    res.json(returns);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllReturn = async(req,res)=>{
  try{
    const returns = await Return.findAll();
    if(!returns){
      res.status(404).json("No Return Request Submitted");
    }
    res.json({data: returns});
  }
  catch(err){
    res.json({error:"Cannot found"})
  }
};
// 3️⃣ Update Return Status (Admin only)
exports.updateReturnStatus = async (req, res) => {
  try {
    const { id } = req.params;   // returnId
    const { status } = req.body; // Pending, Approved, Rejected, Completed

    const returnReq = await Return.findByPk(id);
    if (!returnReq) {
      return res.status(404).json({ error: "Return request not found" });
    }

    returnReq.status = status;
    await returnReq.save();

    res.json({ message: "Return status updated", return: returnReq });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
