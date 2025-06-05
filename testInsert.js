const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Product = require('./models/Products');
const Category = require('./models/Category');

async function runTest() {
    try {
        // Connect to MongoDB
        await connectDB();
        console.log('Connected to MongoDB');

        // Create a test category
        const category = new Category({
            name: 'Test Category',
            description: 'A category for testing',
            imageUrl: 'https://res.cloudinary.com/dtvxoju3p/image/upload/v1746913376/M_J_SPRT_JAM_WARM_UP_PANT_ypo5fv.avif',
            categoryID: 1
        });

        // Save the category
        const savedCategory = await category.save();
        console.log('Category saved:', savedCategory);

        // Create a test product linked to the category
        const product = new Product({
            name: 'Test Product',
            description: 'A product for testing',
            price: 9.99,
            imageUrl: 'https://res.cloudinary.com/dtvxoju3p/image/upload/v1746908611/M_NK_DF_RISE_365_SS_zdaice.avif',
            category: savedCategory._id,
            stockQuantity: 10,
            ProductID: 1
        });

        // Save the product
        const savedProduct = await product.save();
        console.log('Product saved:', savedProduct);

        console.log('Test data inserted successfully!');
    } catch (error) {
        console.error('Error inserting test data:', error);
    } finally {
        // Close the MongoDB connection
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
}

// Run the test
runTest(); 