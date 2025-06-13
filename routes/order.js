const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');

   router.get('/checkout', auth(), orderController.checkout);
   router.post('/place', auth(), orderController.placeOrder);
   router.get('/success', auth(), orderController.orderSuccess);

module.exports = router; 