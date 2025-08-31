const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authMiddleware } = require("../middleware/authMiddleware"); // updated middleware

// ✅ Auth Routes
router.post("/register", adminController.register);
router.post("/login", adminController.login);

// Forgot password (no auth required)
router.post("/request-otp", adminController.forgotPasswordRequestOtp);
router.post("/verify-otp", adminController.forgotPasswordVerifyOtp);
router.post("/reset", adminController.forgotPasswordReset);

// ✅ Protected Admin Routes
router.get("/dashboard", authMiddleware(["admin", "superadmin"]), adminController.getDashboard);
router.get("/all", authMiddleware(["admin", "superadmin"]), adminController.getAllAdmins);

// Block/Unblock Users
router.post("/block/userid/:userId", authMiddleware(["admin", "superadmin"]), adminController.blockUser);
router.post("/unblock/userid/:userId", authMiddleware(["admin", "superadmin"]), adminController.unblockUser);

// ✅ Analytics (admin-only)
router.get("/analytics/top-products", authMiddleware(["admin", "superadmin"]), adminController.getTopSellingProducts);
router.get("/analytics/low-stock", authMiddleware(["admin", "superadmin"]), adminController.getLowStockProducts);
router.get("/analytics/revenue-trends", authMiddleware(["admin", "superadmin"]), adminController.getRevenueTrends);
router.get("/analytics/product-ratings", authMiddleware(["admin", "superadmin"]), adminController.getProductRatings);
router.get("/analytics/category-performance", authMiddleware(["admin", "superadmin"]), adminController.getCategoryPerformance);

router.put("/seller/:sellerId",authMiddleware(["admin", "superadmin"]),adminController.giveAccesstoSeller)

module.exports = router;
