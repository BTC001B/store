const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController");

router.post("/", wishlistController.addToWishlist);
router.get("/userid/:userId", wishlistController.getWishlist);
router.delete("/userid/:userId/productid/:productId", wishlistController.removeFromWishlist);
router.delete("/clear/userid/:userId", wishlistController.clearWishlist);


module.exports = router;
