const Product = require('../models/Products');
const Category = require('../models/Category');
const mongoose = require('mongoose');

exports.getHomePage = async (req, res) => {
  try {
    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      console.log('Database connection state:', mongoose.connection.readyState);
      throw new Error('Database connection not ready. Please try again in a few moments.');
    }

    // Fetch all data in parallel for better performance
    const [featuredProducts, mainCategories, newArrivals] = await Promise.all([
      Product.find({ featured: true }).limit(8).lean(),
      Category.find({ parent: null }).limit(6).lean(),
      Product.find().sort({ createdAt: -1 }).limit(8).lean()
    ]);
    
    res.render('home', {
      title: 'Homepage',
      featuredProducts,
      mainCategories,
      newArrivals,
      error: null
    });
    
  } catch (error) {
    console.error('Home page error:', error);
    res.status(500).render('error', {
      message: 'Error loading home page. Please try again in a few moments.',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
};