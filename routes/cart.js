const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// View routes
router.get('/view', cartController.viewCart);

// API routes
router.post('/add', cartController.addToCart);
router.get('/', cartController.getCart);
router.put('/update', cartController.updateCart);
router.delete('/remove/:productId', cartController.removeFromCart);

module.exports = router;