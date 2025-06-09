const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Product = require('./models/Products');

async function checkProducts() {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        // Get all products
        const products = await Product.find();
        console.log('\nCurrent Products in Database:');
        products.forEach(product => {
            console.log(`\nProduct: ${product.name}`);
            console.log(`Image URL: ${product.imageUrl}`);
        });

    } catch (error) {
        console.error('Error checking products:', error);
    } finally {
        await mongoose.connection.close();
        console.log('\nMongoDB connection closed');
    }
}

// Run the check
checkProducts(); 