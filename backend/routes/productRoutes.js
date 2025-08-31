const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const recommendationController = require("../controllers/recommendationController");

router.post('/', productController.createProduct);
router.get('/', productController.getAllProducts);
router.get("/new",productController.getNewlyAddedProducts);
router.get('/:productId', productController.getProductById);
router.put('/productid/:id', productController.updateProduct);
router.delete('/productid/:id', productController.deleteProduct);

router.get('/top/viewed', productController.getMostViewedProducts);
router.get('/top/selling', productController.getBestSellingProducts);
router.get('/adminid/:adminId', productController.getProductsByAdminId);
router.get('/recently-viewed/userid/:userId', productController.getRecentlyViewedByUser);
router.get('/category/filter', productController.getProductsByCategory);
router.get("/subcategory/filter",productController.getProductsBySubCategory);
router.get("/recommendations/userid/:userId", recommendationController.getPersonalizedRecommendations);
router.get("/subcategory/top-rated", productController.getTopRatedBySubCategory);
router.get("/similar/productId/:id",productController.getSimilarProducts);
router.get("/last-purchased/userid/:userId", productController.getLastPurchasedProducts);



module.exports = router;
