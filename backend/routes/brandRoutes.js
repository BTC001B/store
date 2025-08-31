// routes/brandRoutes.js
const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brandController");

router.post("/", brandController.createBrand);
router.get("/", brandController.getAllBrands);
router.get("/:id", brandController.getBrandById);
router.put("/:id", brandController.updateBrand);
router.delete("/:id", brandController.deleteBrand);
router.get("/brandid/:brandId",brandController.getProductByBrandId);

module.exports = router;
