console.log('products.js route loaded');
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Get all products
router.get('/', productController.getAllProducts);

// Get products by category
router.get('/category/:categoryId', productController.getProductsByCategory);
// Get product details
router.get('/details/:id', productController.getProductDetails);

// Protected routes
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
