const express = require("express");
const sellerController= require("../controllers/sellerController");
const { authMiddleware } = require("../middleware/authMiddleware");
const productController=require("../controllers/productController");
const brandController=require("../controllers/brandController");

const router = express.Router();
// sellerRoutes.js

router.post("/register", sellerController.registerSeller);
router.post("/login", sellerController.loginSeller);
router.put("/update",authMiddleware(["seller"]),sellerController.updateSeller);
router.get("/ownprofile", authMiddleware(["seller"]), sellerController.getSellerProfile);

// Seller product management
router.post('/product', authMiddleware(["seller"]), productController.createProduct);
router.get('/products', authMiddleware(["seller"]), productController.getAllProducts);
router.get('/product/:productId', authMiddleware(["seller"]), productController.getProductById);
router.put('/product/:id', authMiddleware(["seller"]), productController.updateProduct);
router.delete('/product/:id', authMiddleware(["seller"]), productController.deleteProduct);
router.get('/products/seller/:sellerId', authMiddleware(["seller"]), sellerController.getProductsBySellerId);

// Seller brand management
router.post("/brands", authMiddleware(["seller"]), brandController.createBrand);
router.get("/brands", authMiddleware(["seller"]), brandController.getAllBrands);
router.get("/brands/:id", authMiddleware(["seller"]), brandController.getBrandById);
router.put("/brands/:id", authMiddleware(["seller"]), brandController.updateBrand);
router.delete("/brands/:id", authMiddleware(["seller"]), brandController.deleteBrand);
router.get("/brands/:brandId/products", authMiddleware(["seller"]), brandController.getProductByBrandId);
router.get("/brands/seller/:sellerId", authMiddleware(["seller"]), brandController.getBrandBySellerId);

// Orders + demo
router.get("/ordereditems", authMiddleware(["seller"]), sellerController.getOrderedItemsBySeller);
router.get("/dashboard/seller",authMiddleware(["seller"]),sellerController.getDashboardofSeller);



module.exports = router;
