const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { isAuthenticated } = require('../middleware/auth');

router.get('/checkout', isAuthenticated, orderController.checkout);
router.post('/place', isAuthenticated, orderController.placeOrder);
router.get('/success', isAuthenticated, orderController.orderSuccess);

module.exports = router; 