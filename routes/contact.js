const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Contact page route
router.get('/', contactController.getContactPage);

module.exports = router; 