// Import the Cart model
const Cart = require('../models/Cart');
const Product = require('../models/Products');

// Constants
const DELIVERY_FEE = 50;

// Helper function to format price
const formatPrice = (price) => Number(price.toFixed(2));

// Create the cart controller object with all our methods
const cartController = {
    // Add item to cart
    async addToCart(req, res) {
        try {
            // Get product details from request body
            const { productId, quantity } = req.body;
            
            // Validate product exists and has enough stock
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ error: 'Product not found' });
            }
            
            if (product.stockQuantity < quantity) {
                return res.status(400).json({ error: 'Not enough stock available' });
            }

            // Get or create cart using session ID
            let cart = await Cart.findOne({
                $or: [
                    { user: req.session.userId },
                    { sessionId: req.session.id }
                ]
            });
            
            if (!cart) {
                cart = new Cart({
                    user: req.session.userId || null,
                    sessionId: req.session.id,
                    items: [],
                    totalAmount: 0,
                    CartID: Date.now() // Generate unique CartID
                });
            }

            // Check if product already in cart
            const existingItem = cart.items.find(item => item.product.toString() === productId);

            if (existingItem) {
                // Check if new total quantity exceeds stock
                if (product.stockQuantity < existingItem.quantity + quantity) {
                    return res.status(400).json({ error: 'Not enough stock available' });
                }
                // Update quantity if product exists
                existingItem.quantity += quantity;
                existingItem.total = formatPrice(existingItem.quantity * existingItem.price);
            } else {
                // Add new item if product doesn't exist
                cart.items.push({
                    product: productId,
                    quantity: quantity,
                    price: formatPrice(product.price),
                    total: formatPrice(product.price * quantity)
                });
            }

            // Update cart total (subtotal)
            cart.totalAmount = formatPrice(cart.items.reduce((total, item) => total + item.total, 0));
            
            await cart.save();

            // Return updated cart with populated product details
            const updatedCart = await Cart.findById(cart._id).populate('items.product');
            
            res.json({ 
                success: true, 
                cart: updatedCart,
                message: 'Item added to cart successfully'
            });
        } catch (error) {
            console.error('Error adding to cart:', error);
            res.status(500).json({ error: 'Error adding item to cart. Please try again.' });
        }
    },

    // Get cart contents
    async getCart(req, res) {
        try {
            const cart = await Cart.findOne({
                $or: [
                    { user: req.session.userId },
                    { sessionId: req.session.id }
                ]
            }).populate('items.product');
            
            if (!cart) {
                return res.json({ items: [], totalAmount: 0, deliveryFee: DELIVERY_FEE });
            }

            // Add delivery fee to the response
            const response = {
                ...cart.toObject(),
                deliveryFee: DELIVERY_FEE,
                grandTotal: formatPrice(cart.totalAmount + DELIVERY_FEE)
            };
            
            res.json(response);
        } catch (error) {
            console.error('Error getting cart:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // Update cart item quantity
    async updateCart(req, res) {
        try {
            const { productId, quantity } = req.body;
            const cart = await Cart.findOne({
                $or: [
                    { user: req.session.userId },
                    { sessionId: req.session.id }
                ]
            });
            
            if (!cart) {
                return res.status(404).json({ error: 'Cart not found' });
            }

            // Update item quantity
            const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

            if (itemIndex === -1) {
                return res.status(404).json({ error: 'Item not found in cart' });
            }

            // Update quantity
            cart.items[itemIndex].quantity = quantity;
            cart.items[itemIndex].total = formatPrice(cart.items[itemIndex].price * quantity);

            // Update cart total
            cart.totalAmount = formatPrice(cart.items.reduce((total, item) => total + item.total, 0));
            
            await cart.save();

            // Add delivery fee to the response
            const response = {
                ...cart.toObject(),
                deliveryFee: DELIVERY_FEE,
                grandTotal: formatPrice(cart.totalAmount + DELIVERY_FEE)
            };

            res.json({ success: true, cart: response });
        } catch (error) {
            console.error('Error updating cart:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // Remove item from cart
    async removeFromCart(req, res) {
        try {
            const { productId } = req.params;
            const cart = await Cart.findOne({
                $or: [
                    { user: req.session.userId },
                    { sessionId: req.session.id }
                ]
            });
            
            if (!cart) {
                return res.status(404).json({ error: 'Cart not found' });
            }

            // Remove item
            cart.items = cart.items.filter(item => item.product.toString() !== productId);

            // Update cart total
            cart.totalAmount = formatPrice(cart.items.reduce((total, item) => total + item.total, 0));
            
            await cart.save();

            // Add delivery fee to the response
            const response = {
                ...cart.toObject(),
                deliveryFee: DELIVERY_FEE,
                grandTotal: formatPrice(cart.totalAmount + DELIVERY_FEE)
            };

            res.json({ success: true, cart: response });
        } catch (error) {
            console.error('Error removing from cart:', error);
            res.status(500).json({ error: error.message });
        }
    },

    // View cart page
    async viewCart(req, res) {
        try {
            let cart = await Cart.findOne({
                $or: [
                    { user: req.session.userId },
                    { sessionId: req.session.id }
                ]
            }).populate('items.product');
            
            if (!cart) {
                // Create a plain object with the same structure
                cart = {
                    items: [],
                    totalAmount: 0,
                    toObject: function() {
                        return {
                            items: this.items,
                            totalAmount: this.totalAmount
                        };
                    }
                };
            }

            // Add delivery fee to the cart object
            const cartWithDelivery = {
                ...(typeof cart.toObject === 'function' ? cart.toObject() : cart),
                deliveryFee: DELIVERY_FEE,
                grandTotal: formatPrice((cart.totalAmount || 0) + DELIVERY_FEE)
            };

            res.render('pages/Cart/cart', { 
                cart: cartWithDelivery,
                title: 'Shopping Cart'
            });
        } catch (error) {
            console.error('Error viewing cart:', error);
            res.status(500).render('error', { 
                message: 'Error loading cart. Please try again later.',
                error: process.env.NODE_ENV === 'development' ? error : {}
            });
        }
    }
};

module.exports = cartController;