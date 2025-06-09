const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Product = require('./models/Products');
const Category = require('./models/Category');

async function runTest() {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        // Create test categories
        console.log('Creating categories...');
        const categories = [
            {
                
                name: 'Mobile Phones',
                description: 'Latest smartphones and mobile devices',
                imageUrl: 'https://res.cloudinary.com/dtvxoju3p/image/upload/v1749430471/insta-item3_tmmjpt.jpg',
                categoryID: 1,
                products: []
            },
            {
                name: 'TVs',
                description: 'High-quality televisions and displays',
                imageUrl: 'https://res.cloudinary.com/dtvxoju3p/image/upload/v1749430793/Samsung-UHD-4K-Smart-TV-50-Inch-50DU7000-2-600x600_s7gh4n.png',
                categoryID: 2,
                products: []
            },
            {
                name: 'Headphones',
                description: 'Premium audio devices and accessories',
                imageUrl: 'https://res.cloudinary.com/dtvxoju3p/image/upload/v1749430525/images_wedk9g.jpg',
                categoryID: 3,
                products: []
            },
            {
                name: 'Laptops',
                description: 'Powerful computing devices for work and entertainment',
                imageUrl: 'https://res.cloudinary.com/dtvxoju3p/image/upload/v1749430458/laptop_flze8k.avif',
                categoryID: 4,
                products: []
            }
        ];

        // Save categories
        const savedCategories = await Category.insertMany(categories);
        console.log('Categories saved:', savedCategories.map(c => ({ id: c._id, name: c.name })));

        // Create test products
        console.log('Creating products...');
        const products = [
            // Mobile Phones
            {
                name: 'iPhone 13',
                description: 'The latest iPhone with advanced features and powerful performance',
                price: 999.99,
                imageUrl: 'https://res.cloudinary.com/dtvxoju3p/image/upload/v1749430452/iphone13_ranzmm.jpg',
                category: savedCategories[0]._id,
                stockQuantity: 50,
                ProductID: 1
            },
            {
                name: 'iPhone 12 Pro',
                description: 'Premium iPhone model with enhanced camera and performance',
                price: 1299.99,
                imageUrl: 'https://res.cloudinary.com/dtvxoju3p/image/upload/v1749430471/insta-item3_tmmjpt.jpg',
                category: savedCategories[0]._id,
                stockQuantity: 30,
                ProductID: 2
            },
            // TVs
            {
                name: 'LG TV',
                description: '4K Smart TV with stunning picture quality and smart features',
                price: 799.99,
                imageUrl: 'https://res.cloudinary.com/dtvxoju3p/image/upload/v1749430799/lg-43-fhd-smart-led-tv-43lm6370pva-4_main_ctz73j.jpg',
                category: savedCategories[1]._id,
                stockQuantity: 25,
                ProductID: 3
            },
            {
                name: 'Samsung TV',
                description: 'QLED Smart TV with immersive viewing experience',
                price: 899.99,
                imageUrl: 'https://res.cloudinary.com/dtvxoju3p/image/upload/v1749430793/Samsung-UHD-4K-Smart-TV-50-Inch-50DU7000-2-600x600_s7gh4n.png',
                category: savedCategories[1]._id,
                stockQuantity: 20,
                ProductID: 4
            },
            // Headphones
            {
                name: 'Sony Headphones',
                description: 'Noise-cancelling wireless headphones with premium sound quality',
                price: 299.99,
                imageUrl: 'https://res.cloudinary.com/dtvxoju3p/image/upload/v1749430525/images_wedk9g.jpg',
                category: savedCategories[2]._id,
                stockQuantity: 40,
                ProductID: 5
            },
            {
                name: 'Philips Headphones',
                description: 'Comfortable over-ear headphones with balanced sound',
                price: 199.99,
                imageUrl: 'https://res.cloudinary.com/dtvxoju3p/image/upload/v1749430437/airpods_fdg85t.webp',
                category: savedCategories[2]._id,
                stockQuantity: 35,
                ProductID: 6
            },
            // Laptops
            {
                name: 'Acer Laptop',
                description: 'Powerful laptop for work and gaming with high performance',
                price: 899.99,
                imageUrl: 'https://res.cloudinary.com/dtvxoju3p/image/upload/v1749430461/mack_xfhmtl.webp',
                category: savedCategories[3]._id,
                stockQuantity: 15,
                ProductID: 7
            },
            {
                name: 'HP Laptop',
                description: 'Professional laptop with long battery life and sleek design',
                price: 799.99,
                imageUrl: 'https://res.cloudinary.com/dtvxoju3p/image/upload/v1749430458/laptop_flze8k.avif',
                category: savedCategories[3]._id,
                stockQuantity: 20,
                ProductID: 8
            }
        ];

        // Save products
        const savedProducts = await Product.insertMany(products);
        console.log('Products saved:', savedProducts.map(p => ({ id: p._id, name: p.name, category: p.category })));

        // Update categories with their products
        console.log('Updating categories with products...');
        for (const category of savedCategories) {
            const categoryProducts = savedProducts.filter(p => p.category.toString() === category._id.toString());
            await Category.findByIdAndUpdate(
                category._id,
                { $set: { products: categoryProducts.map(p => p._id) } }
            );
        }

        // Verify the data was saved correctly
        const verifyCategories = await Category.find().populate('products');
        console.log('\nVerification - Categories with products:');
        verifyCategories.forEach(category => {
            console.log(`\nCategory: ${category.name}`);
            console.log(`Products count: ${category.products.length}`);
            console.log('Products:', category.products.map(p => p.name));
        });

        console.log('\nTest data inserted successfully!');
    } catch (error) {
        console.error('Error inserting test data:', error);
    } finally {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
}

// Run the test
runTest();