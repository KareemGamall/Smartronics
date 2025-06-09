console.log('products.js route loaded');
const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Get all products
router.get('/', productController.getAllProducts);

// Get products by category
router.get('/category/:categoryId', productController.getProductsByCategory);

// Category-specific routes
router.get('/headphones', productController.getHeadphones);
router.get('/mobilephones', productController.getMobilePhones);
router.get('/tvs', productController.getTVs);
router.get('/labtops', productController.getLaptops);

// Protected routes
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
