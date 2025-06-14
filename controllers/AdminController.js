const User = require('../models/user');
const Product = require('../models/Products');
const Category = require('../models/Category');
const bcrypt = require('bcrypt');
const Order = require('../models/Order');

class AdminController {
    // Dashboard
    static async getDashboard(req, res) {
        try {
            const [totalUsers, totalProducts, orders] = await Promise.all([
                User.countDocuments().catch(() => 0),
                Product.countDocuments().catch(() => 0),
                Order.find()
                    .populate('products.product')
                    .catch(() => [])
            ]);

            console.log('Total orders found:', orders.length);
            if (orders.length > 0) {
                console.log('Sample order:', JSON.stringify(orders[0], null, 2));
            }

            // Calculate monthly revenue
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

            console.log('Current date:', now.toISOString());
            console.log('Date range for monthly revenue:', {
                startOfMonth: startOfMonth.toISOString(),
                endOfMonth: endOfMonth.toISOString()
            });

            const monthlyOrders = orders.filter(order => {
                const orderDate = new Date(order.OrderDate);
                // Check if order date is in the future
                if (orderDate > now) {
                    console.log('Future order found:', orderDate.toISOString());
                    return false;
                }
                const isInRange = orderDate >= startOfMonth && orderDate <= endOfMonth;
                console.log('Order date:', orderDate.toISOString(), 'Is in monthly range:', isInRange);
                return isInRange;
            });

            console.log('Orders in current month:', monthlyOrders.length);

            const monthlyRevenue = monthlyOrders.reduce((total, order) => {
                const amount = order.totalAmount || 0;
                console.log('Order totalAmount:', amount);
                return total + amount;
            }, 0);

            // Calculate annual revenue
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

            console.log('Date range for annual revenue:', {
                startOfYear: startOfYear.toISOString(),
                endOfYear: endOfYear.toISOString()
            });

            const annualOrders = orders.filter(order => {
                const orderDate = new Date(order.OrderDate);
                // Check if order date is in the future
                if (orderDate > now) {
                    console.log('Future order found:', orderDate.toISOString());
                    return false;
                }
                const isInRange = orderDate >= startOfYear && orderDate <= endOfYear;
                console.log('Order date:', orderDate.toISOString(), 'Is in annual range:', isInRange);
                return isInRange;
            });

            console.log('Orders in current year:', annualOrders.length);

            const annualRevenue = annualOrders.reduce((total, order) => {
                const amount = order.totalAmount || 0;
                console.log('Order totalAmount:', amount);
                return total + amount;
            }, 0);

            console.log('Final calculations:', {
                monthlyRevenue,
                annualRevenue,
                totalOrders: orders.length,
                currentDate: now.toISOString()
            });

            res.render('pages/admin/dashboard', {
                title: 'Admin Dashboard',
                stats: {
                    totalUsers,
                    totalProducts,
                    monthlyRevenue,
                    annualRevenue
                },
                layout: 'layouts/admin'
            });
        } catch (error) {
            console.error('Dashboard Error:', error);
            res.status(500).render('pages/error', {
                message: 'Error loading dashboard',
                error: process.env.NODE_ENV === 'development' ? error : {},
                layout: false
            });
        }
    }

    // User Management
    static async getUsers(req, res) {
        try {
            const users = await User.find().select('-password').catch(() => []);
            res.render('pages/admin/users', {
                title: 'User Management',
                users,
                layout: 'layouts/admin'
            });
        } catch (error) {
            console.error('Users Error:', error);
            res.status(500).render('pages/error', {
                message: 'Error loading users',
                error: process.env.NODE_ENV === 'development' ? error : {},
                layout: false
            });
        }
    }

    // Product Management
    static async getProducts(req, res) {
        try {
            const [products, categories] = await Promise.all([
                Product.find().populate('category').catch(() => []),
                Category.find().catch(() => [])
            ]);
            
            res.render('pages/admin/products', {
                title: 'Product Management',
                products,
                categories,
                layout: 'layouts/admin'
            });
        } catch (error) {
            console.error('Products Error:', error);
            res.status(500).render('pages/error', {
                message: 'Error loading products',
                error: process.env.NODE_ENV === 'development' ? error : {},
                layout: false
            });
        }
    }

    // Get single product
    static async getProduct(req, res) {
        try {
            const product = await Product.findById(req.params.id).populate('category');
            if (!product) {
                return res.status(404).json({ success: false, message: 'Product not found' });
            }
            res.json(product);
        } catch (error) {
            console.error('Get Product Error:', error);
            res.status(500).json({ success: false, message: 'Error fetching product' });
        }
    }

    // Create product
    static async createProduct(req, res) {
        try {
            console.log('Raw request body:', req.body); // Debug log

            const { name, price, category, stockQuantity, image, description } = req.body;
            
            console.log('Parsed product data:', {
                name,
                price,
                category,
                stockQuantity,
                image,
                description
            });

            // Validate required fields
            const requiredFields = ['name', 'price', 'category', 'stockQuantity', 'image', 'description'];
            const missingFields = requiredFields.filter(field => {
                const value = req.body[field];
                console.log(`Checking field ${field}:`, value); // Debug log
                return value === undefined || value === null || value === '';
            });
            
            if (missingFields.length > 0) {
                console.log('Missing fields:', missingFields); // Debug log
                return res.status(400).json({ 
                    success: false, 
                    message: `Missing required fields: ${missingFields.join(', ')}`,
                    receivedData: req.body
                });
            }

            // Validate data types and values
            if (isNaN(price) || isNaN(stockQuantity)) {
                return res.status(400).json({
                    success: false,
                    message: 'Price and stock must be numbers'
                });
            }

            // Validate non-negative values
            const parsedPrice = parseFloat(price);
            const parsedStock = parseInt(stockQuantity);

            if (parsedPrice < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Price cannot be negative'
                });
            }

            if (parsedStock < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Stock quantity cannot be negative'
                });
            }

            // Create product
            const product = await Product.create({
                name,
                price: parsedPrice,
                category,
                stockQuantity: parsedStock,
                imageUrl: image,
                description
            });

            console.log('Created product:', product); // Debug log

            res.status(201).json({ 
                success: true, 
                message: 'Product created successfully',
                product 
            });
        } catch (error) {
            console.error('Create Product Error:', error);
            res.status(500).json({ 
                success: false, 
                message: error.message || 'Error creating product'
            });
        }
    }

    // Update product
    static async updateProduct(req, res) {
        try {
            const { name, price, category, stockQuantity, image, description } = req.body;
            
            console.log('Received update data:', req.body); // Debug log

            // Validate required fields
            const requiredFields = ['name', 'price', 'category', 'stockQuantity', 'image', 'description'];
            const missingFields = requiredFields.filter(field => !req.body[field]);
            
            if (missingFields.length > 0) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Missing required fields: ${missingFields.join(', ')}`,
                    receivedData: req.body
                });
            }

            // Validate data types and values
            if (isNaN(price) || isNaN(stockQuantity)) {
                return res.status(400).json({
                    success: false,
                    message: 'Price and stock must be numbers'
                });
            }

            // Validate non-negative values
            const parsedPrice = parseFloat(price);
            const parsedStock = parseInt(stockQuantity);

            if (parsedPrice < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Price cannot be negative'
                });
            }

            if (parsedStock < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Stock quantity cannot be negative'
                });
            }
            
            const product = await Product.findByIdAndUpdate(
                req.params.id,
                {
                    name,
                    price: parsedPrice,
                    category,
                    stockQuantity: parsedStock,
                    imageUrl: image,
                    description
                },
                { new: true, runValidators: true }
            );

            if (!product) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Product not found' 
                });
            }

            console.log('Updated product:', product); // Debug log

            res.json({ 
                success: true, 
                message: 'Product updated successfully',
                product 
            });
        } catch (error) {
            console.error('Update Product Error:', error);
            res.status(500).json({ 
                success: false, 
                message: error.message || 'Error updating product'
            });
        }
    }

    // Delete product
    static async deleteProduct(req, res) {
        try {
            const product = await Product.findByIdAndDelete(req.params.id);
            
            if (!product) {
                return res.status(404).json({ success: false, message: 'Product not found' });
            }

            res.json({ success: true, message: 'Product deleted successfully' });
        } catch (error) {
            console.error('Delete Product Error:', error);
            res.status(500).json({ success: false, message: 'Error deleting product' });
        }
    }

    // API Endpoints for Dashboard Stats
    static async getStats(req, res) {
        try {
            const [totalUsers, totalProducts] = await Promise.all([
                User.countDocuments().catch(() => 0),
                Product.countDocuments().catch(() => 0)
            ]);

            res.json({
                success: true,
                data: {
                    totalUsers,
                    totalProducts
                }
            });
        } catch (error) {
            console.error('Stats Error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching statistics'
            });
        }
    }

    // Get single user
    static async getUser(req, res) {
        try {
            const user = await User.findById(req.params.id).select('-password');
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
            res.json(user);
        } catch (error) {
            console.error('Get User Error:', error);
            res.status(500).json({ success: false, message: 'Error fetching user' });
        }
    }

    // Create user
    static async createUser(req, res) {
        try {
            const { name, email, phoneNumber, password, role } = req.body;
            
            console.log('Received user data:', req.body);

            // Validate required fields
            if (!name || !email || !phoneNumber || !password || !role) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'All fields are required',
                    receivedData: req.body
                });
            }

            // Check if email already exists
            const existingEmail = await User.findOne({ email });
            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }

            // Check if phone number already exists
            const existingPhone = await User.findOne({ phoneNumber });
            if (existingPhone) {
                return res.status(400).json({
                    success: false,
                    message: 'Phone number already exists'
                });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const user = await User.create({
                name,
                email,
                phoneNumber,
                password: hashedPassword,
                role
            });

            console.log('Created user:', user);

            // Return success response without password
            const userResponse = {
                _id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                role: user.role
            };

            return res.status(201).json({ 
                success: true, 
                message: 'User created successfully',
                user: userResponse
            });
        } catch (error) {
            console.error('Create User Error:', error);
            // Ensure we always return a JSON response
            return res.status(500).json({ 
                success: false, 
                message: error.message || 'Error creating user',
                error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
            });
        }
    }

    // Update user
    static async updateUser(req, res) {
        try {
            const { name, email, phoneNumber, password, role } = req.body;
            
            console.log('Received update data:', req.body);

            // Validate required fields
            if (!name || !email || !phoneNumber || !role) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'All fields are required',
                    receivedData: req.body
                });
            }

            // Check if email exists for other users
            const existingEmail = await User.findOne({ 
                email, 
                _id: { $ne: req.params.id } 
            });
            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }

            // Check if phone number exists for other users
            const existingPhone = await User.findOne({ 
                phoneNumber, 
                _id: { $ne: req.params.id } 
            });
            if (existingPhone) {
                return res.status(400).json({
                    success: false,
                    message: 'Phone number already exists'
                });
            }

            const updateData = {
                name,
                email,
                phoneNumber,
                role
            };

            // Only update password if provided
            if (password) {
                const salt = await bcrypt.genSalt(10);
                updateData.password = await bcrypt.hash(password, salt);
            }

            const user = await User.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true, runValidators: true }
            ).select('-password');

            if (!user) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'User not found' 
                });
            }

            console.log('Updated user:', user);

            return res.json({ 
                success: true, 
                message: 'User updated successfully',
                user
            });
        } catch (error) {
            console.error('Update User Error:', error);
            return res.status(500).json({ 
                success: false, 
                message: error.message || 'Error updating user'
            });
        }
    }

    // Delete user
    static async deleteUser(req, res) {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            res.json({ success: true, message: 'User deleted successfully' });
        } catch (error) {
            console.error('Delete User Error:', error);
            res.status(500).json({ success: false, message: 'Error deleting user' });
        }
    }

    // Create test order
    static async createTestOrder(req, res) {
        try {
            // Find a product to use in the test order
            const product = await Product.findOne();
            if (!product) {
                return res.status(404).json({ success: false, message: 'No products found to create test order' });
            }

            // Create a test order
            const order = await Order.create({
                user: req.user._id,
                products: [{
                    product: product._id,
                    quantity: 2
                }],
                totalAmount: product.price * 2,
                orderStatus: 'Confirmed',
                OrderID: Date.now(), // Using timestamp as a simple unique ID
                ShippingAddress: 'Test Address',
                ContactNumber: '12345678901',
                PaymentMethod: 'Cash on Delivery',
                OrderDate: new Date() // Current date
            });

            console.log('Test order created:', order);

            res.status(201).json({
                success: true,
                message: 'Test order created successfully',
                order
            });
        } catch (error) {
            console.error('Create Test Order Error:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Error creating test order'
            });
        }
    }

    // Debug route to show all orders and calculations
    static async debugOrders(req, res) {
        try {
            const orders = await Order.find().populate('products.product');
            const now = new Date();
            
            const orderDetails = orders.map(order => {
                const orderDate = new Date(order.OrderDate);
                const isFuture = orderDate > now;
                const isInCurrentMonth = orderDate.getMonth() === now.getMonth() && 
                                       orderDate.getFullYear() === now.getFullYear();
                const isInCurrentYear = orderDate.getFullYear() === now.getFullYear();
                
                return {
                    orderId: order._id,
                    orderDate: orderDate.toISOString(),
                    totalAmount: order.totalAmount,
                    isFuture,
                    isInCurrentMonth,
                    isInCurrentYear,
                    currentDate: now.toISOString()
                };
            });

            const monthlyRevenue = orderDetails
                .filter(order => !order.isFuture && order.isInCurrentMonth)
                .reduce((sum, order) => sum + order.totalAmount, 0);

            const annualRevenue = orderDetails
                .filter(order => !order.isFuture && order.isInCurrentYear)
                .reduce((sum, order) => sum + order.totalAmount, 0);

            res.json({
                currentDate: now.toISOString(),
                totalOrders: orders.length,
                orders: orderDetails,
                calculations: {
                    monthlyRevenue,
                    annualRevenue
                }
            });
        } catch (error) {
            console.error('Debug Orders Error:', error);
            res.status(500).json({ 
                success: false, 
                message: error.message || 'Error fetching orders'
            });
        }
    }

    // Order Management
    static async getOrders(req, res) {
        try {
            const orders = await Order.find()
                .populate('user')
                .populate('products.product')
                .sort({ OrderDate: -1 });
            res.render('pages/admin/orders', {
                title: 'Order Management',
                orders,
                layout: 'layouts/admin'
            });
        } catch (error) {
            console.error('Orders Error:', error);
            res.status(500).render('pages/error', {
                message: 'Error loading orders',
                error: process.env.NODE_ENV === 'development' ? error : {},
                layout: false
            });
        }
    }
}

module.exports = AdminController; 