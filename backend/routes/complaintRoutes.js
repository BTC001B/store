const express = require('express');
const router = express.Router();
const controller=require("../controllers/complaintController");

router.post("/create/usertoseller",controller.createComplaintAgainstSeller);
router.post("/create/sellertouser",controller.createComplaintAgainstUser);
router.get("/userid/:userId",controller.getComplaintsByUser);
router.get("/sellerid/:sellerId",controller.getComplaintsBySeller);
router.put("/update/status/:id",controller.updateComplaintStatus);
router.get("/all",controller.getAllComplaints);
router.get("/complaintid/:id",controller.getComplaintById);

module.exports=router;