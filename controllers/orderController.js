const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Products');

// Constants
const DELIVERY_FEE = 50;

// Helper function to format price
const formatPrice = (price) => Number(price.toFixed(2));

// Helper function to validate phone number
const validatePhoneNumber = (phone) => {
    const phoneNumber = phone.replace(/\D/g, ''); // Remove non-digits
    return phoneNumber.length === 11; // Must be exactly 11 digits
};

const orderController = {
    // Show checkout page
    async checkout(req, res) {
        try {
            const cart = await Cart.findOne({
                $or: [
                    { user: req.session.userId },
                    { sessionId: req.session.id }
                ]
            }).populate('items.product');

            if (!cart || cart.items.length === 0) {
                return res.redirect('/cart/view');
            }

            // Add delivery fee to the cart object
            const cartWithDelivery = {
                ...cart.toObject(),
                deliveryFee: DELIVERY_FEE,
                grandTotal: formatPrice(cart.totalAmount + DELIVERY_FEE)
            };

            res.render('pages/Order/checkout', {
                cart: cartWithDelivery,
                title: 'Checkout'
            });
        } catch (error) {
            console.error('Error in checkout:', error);
            res.status(500).render('error', {
                error: 'Error loading checkout page. Please try again.'
            });
        }
    },

    // Place order
    async placeOrder(req, res) {
        try {
            console.log('Starting order placement process...');
            const { shippingAddress, contactPhone } = req.body;

            // Validate phone number
            if (!validatePhoneNumber(contactPhone)) {
                console.log('Invalid phone number:', contactPhone);
                return res.status(400).render('checkout', {
                    error: 'Phone number must be exactly 11 digits',
                    cart: req.body.cart,
                    title: 'Checkout'
                });
            }

            // Get cart
            console.log('Fetching cart...');
            const cart = await Cart.findOne({
                $or: [
                    { user: req.session.userId },
                    { sessionId: req.session.id }
                ]
            }).populate('items.product');

            if (!cart || cart.items.length === 0) {
                console.log('Cart is empty or not found');
                return res.status(400).json({ error: 'Cart is empty' });
            }

            console.log('Cart found with items:', cart.items.length);

            // Create order
            console.log('Creating new order...');
            const order = new Order({
                user: req.session.userId || null,
                products: cart.items.map(item => ({
                    product: item.product._id,
                    quantity: item.quantity
                })),
                totalAmount: formatPrice(cart.totalAmount + DELIVERY_FEE),
                orderStatus: 'Confirmed',
                OrderID: Date.now(),
                ShippingAddress: shippingAddress,
                ContactNumber: contactPhone.replace(/\D/g, ''), // Remove non-digits
                PaymentMethod: 'Cash on Delivery'
            });

            // Save order
            console.log('Saving order to database...');
            const savedOrder = await order.save();
            console.log('Order saved successfully with ID:', savedOrder._id);

            // Update product stock
            console.log('Updating product stock...');
            for (const item of cart.items) {
                await Product.findByIdAndUpdate(item.product._id, {
                    $inc: { stockQuantity: -item.quantity }
                });
                console.log(`Updated stock for product ${item.product._id}`);
            }

            // Clear cart
            console.log('Clearing cart...');
            await Cart.findByIdAndDelete(cart._id);
            console.log('Cart cleared successfully');

            // Store order ID in session for success page
            req.session.lastOrderId = savedOrder._id;
            console.log('Order ID stored in session:', savedOrder._id);

            // Redirect to success page
            res.redirect('/order/success');
        } catch (error) {
            console.error('Error placing order:', error);
            res.status(500).render('error', {
                error: 'Error placing order. Please try again.'
            });
        }
    },

    // Show order success page
    async orderSuccess(req, res) {
        try {
            const orderId = req.session.lastOrderId;
            if (!orderId) {
                console.log('No order ID found in session');
                return res.redirect('/');
            }

            console.log('Fetching order details for ID:', orderId);
            const order = await Order.findById(orderId)
                .populate('products.product');

            if (!order) {
                console.log('Order not found in database');
                return res.redirect('/');
            }

            console.log('Order found, rendering success page');
            res.render('pages/Order/order-success', {
                order: order,
                title: 'Order Confirmation'
            });
        } catch (error) {
            console.error('Error loading order success page:', error);
            res.status(500).render('error', {
                error: 'Error loading order details. Please try again.'
            });
        }
    }
};

module.exports = orderController; 