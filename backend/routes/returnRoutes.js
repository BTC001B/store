const express = require("express");
const router = express.Router();
const controller = require("../controllers/returnController");

// Create a return request
router.post("/create", controller.createReturn);

// Get all returns (admin) OR user returns (?userId=5)
router.get("/:id", controller.getReturnsById);

router.put("/update/:id", controller.updateReturnStatus);
router.get("/all",controller.getAllReturn);

module.exports = router;
