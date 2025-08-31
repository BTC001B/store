const express = require("express");
const sellerController= require("../controllers/sellerController");
const { authMiddleware } = require("../middleware/authMiddleware");
const productController=require("../controllers/productController");

const router = express.Router();

// Public Routes
router.post("/register", sellerController.registerSeller);
router.post("/login", sellerController.loginSeller);

// Protected Routes (Seller Only)
router.get("/profile", authMiddleware(["seller"]), sellerController.getSellerProfile);

router.get("/",authMiddleware(["admin"]) , sellerController.getAllSellers);              
router.get("/:id", authMiddleware(["admin"]), sellerController.getSellerById);           
router.patch("/:id/block", authMiddleware(["admin"]), sellerController.blockUnblockSeller); 
router.delete("/:id", authMiddleware(["admin"]), sellerController.deleteSeller);  

router.post('/',authMiddleware(["seller"]), productController.createProduct);
router.get('/',authMiddleware(["seller"]), productController.getAllProducts);
router.get('/:productId',authMiddleware(["seller"]), productController.getProductById);
router.put('/productid/:id',authMiddleware(["seller"]), productController.updateProduct);
router.delete('/productid/:id',authMiddleware(["seller"]), productController.deleteProduct);


module.exports = router;
