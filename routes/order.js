const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// View routes
router.get('/checkout', orderController.checkout);
router.get('/success', orderController.orderSuccess);

// API routes
router.post('/place', orderController.placeOrder);

module.exports = router; 