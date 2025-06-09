console.log('productController.js loaded');
const Product = require('../models/Products');
const Category = require('../models/Category');

const productController = {
    async getAllProducts(req, res) {
        console.log('GET /products route hit'); // Log when route is hit
        try {
            console.log('Attempting to fetch products...');
            // First get products without population
            const products = await Product.find();
            console.log('Products found:', products.length); // Log number of products found
            
            if (!products || products.length === 0) {
                console.log('No products found in database');
                return res.render('products', { 
                    products: [],
                    message: 'No products available at the moment.'
                });
            }

            // Try to populate categories if available
            try {
                await Product.populate(products, { path: 'category' });
            } catch (populateError) {
                console.error('Error populating categories:', populateError);
                // Continue without populated categories
            }

            res.render('products', { 
                products: products,
                title: 'Our Products'
            });
        } catch (error) {
            console.error('Detailed error in getAllProducts:', error);
            console.error('Error stack:', error.stack);
            res.status(500).render('error', { 
                error: 'Error loading products. Please try again later.'
            });
        }
    },

    async createProduct(req, res) {
        try {
            const { name, price, description, stockQuantity, category, imageUrl } = req.body;
            
            const product = new Product({
                name,
                price,
                description,
                stockQuantity,
                category,
                imageUrl,
                ProductID: Date.now() // Generate unique ProductID
            });

            await product.save();
            res.status(201).json({ 
                success: true, 
                message: 'Product created successfully',
                product 
            });
        } catch (error) {
            console.error('Error creating product:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Error creating product. Please try again.' 
            });
        }
    },

    async updateProduct(req, res) {
        try {
            const { id } = req.params;
            const { name, price, description, stockQuantity, category, imageUrl } = req.body;

            const product = await Product.findByIdAndUpdate(
                id,
                { 
                    name, 
                    price, 
                    description, 
                    stockQuantity, 
                    category, 
                    imageUrl 
                },
                { new: true, runValidators: true }
            );

            if (!product) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'Product not found' 
                });
            }

            res.json({ 
                success: true, 
                message: 'Product updated successfully',
                product 
            });
        } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Error updating product. Please try again.' 
            });
        }
    },

    async deleteProduct(req, res) {
        try {
            const { id } = req.params;
            const product = await Product.findByIdAndDelete(id);

            if (!product) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'Product not found' 
                });
            }

            res.json({ 
                success: true, 
                message: 'Product deleted successfully' 
            });
        } catch (error) {
            console.error('Error deleting product:', error);
            res.status(500).json({ 
                success: false, 
                error: 'Error deleting product. Please try again.' 
            });
        }
    }
};

module.exports = productController;