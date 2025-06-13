const Cart = require('../models/Cart');
const Product = require('../models/Products');

const DELIVERY_FEE = 50;

// Helper functions
const formatPrice = (price) => Number(price.toFixed(2));

const createCartResponse = (cart) => ({
    ...cart.toObject(),
    deliveryFee: DELIVERY_FEE,
    grandTotal: formatPrice(cart.totalAmount + DELIVERY_FEE)
});

const handleEmptyCart = () => ({
    items: [],
    totalAmount: 0,
    deliveryFee: DELIVERY_FEE,
    grandTotal: formatPrice(DELIVERY_FEE)
});

// Cart helper class
class CartHelper {
    static async findUserCart(req) {
        return await Cart.findOne({
            $or: [
                { user: req.session.userId },
                { sessionId: req.session.id }
            ]
        });
    }

    static async findUserCartWithProducts(req) {
        return await Cart.findOne({
            $or: [
                { user: req.session.userId },
                { sessionId: req.session.id }
            ]
        }).populate('items.product');
    }

    static createNewCart(req) {
        return new Cart({
            user: req.session.userId || null,
            sessionId: req.session.id,
            items: [],
            totalAmount: 0,
            CartID: Date.now()
        });
    }

    static findCartItem(cart, productId) {
        return cart.items.find(item => {
            const itemProductId = item.product._id ? 
                item.product._id.toString() : 
                item.product.toString();
            return itemProductId === productId;
        });
    }

    static findCartItemIndex(cart, productId) {
        return cart.items.findIndex(item => {
            const itemProductId = item.product._id ? 
                item.product._id.toString() : 
                item.product.toString();
            return itemProductId === productId;
        });
    }

    static updateCartTotals(cart) {
        cart.totalAmount = formatPrice(
            cart.items.reduce((total, item) => total + item.total, 0)
        );
    }

    static async validateProductStock(productId, requestedQuantity, currentQuantity = 0) {
        const product = await Product.findById(productId);
        
        if (!product) {
            throw new Error('Product not found');
        }

        const totalQuantity = currentQuantity + requestedQuantity;
        if (product.stockQuantity < totalQuantity) {
            throw new Error('Not enough stock available');
        }

        return product;
    }
}

// Error messages
const ERROR_MESSAGES = {
    PRODUCT_NOT_FOUND: 'Product not found',
    INSUFFICIENT_STOCK: 'Not enough stock available',
    CART_NOT_FOUND: 'Cart not found',
    ITEM_NOT_FOUND: 'Item not found in cart',
    GENERAL_ERROR: 'An error occurred. Please try again.'
};

const cartController = {
    // Add item to cart
    async addToCart(req, res) {
        try {
            const { productId, quantity } = req.body;
            
            // Find or create cart
            let cart = await CartHelper.findUserCart(req);
            if (!cart) {
                cart = CartHelper.createNewCart(req);
            }

            // Check if product already exists in cart
            const existingItem = CartHelper.findCartItem(cart, productId);
            const currentQuantity = existingItem ? existingItem.quantity : 0;

            // Validate stock
            const product = await CartHelper.validateProductStock(
                productId, 
                quantity, 
                currentQuantity
            );

            if (existingItem) {
                // Update existing item
                existingItem.quantity += quantity;
                existingItem.total = formatPrice(existingItem.quantity * existingItem.price);
            } else {
                // Add new item
                cart.items.push({
                    product: productId,
                    quantity: quantity,
                    price: formatPrice(product.price),
                    total: formatPrice(product.price * quantity)
                });
            }

            // Update cart totals and save
            CartHelper.updateCartTotals(cart);
            await cart.save();

            // Return populated cart
            const updatedCart = await Cart.findById(cart._id).populate('items.product');
            
            res.json({ 
                success: true, 
                cart: updatedCart,
                message: 'Item added to cart successfully'
            });

        } catch (error) {
            console.error('Error adding to cart:', error);
            
            if (error.message === 'Product not found') {
                return res.status(404).json({ error: ERROR_MESSAGES.PRODUCT_NOT_FOUND });
            }
            if (error.message === 'Not enough stock available') {
                return res.status(400).json({ error: ERROR_MESSAGES.INSUFFICIENT_STOCK });
            }
            
            res.status(500).json({ error: ERROR_MESSAGES.GENERAL_ERROR });
        }
    },

    // Get cart contents
    async getCart(req, res) {
        try {
            const cart = await CartHelper.findUserCartWithProducts(req);
            
            if (!cart) {
                return res.json(handleEmptyCart());
            }

            res.json(createCartResponse(cart));

        } catch (error) {
            console.error('Error getting cart:', error);
            res.status(500).json({ error: ERROR_MESSAGES.GENERAL_ERROR });
        }
    },

    // Update cart item quantity
    async updateCart(req, res) {
        try {
            const { productId, quantity } = req.body;
            
            const cart = await CartHelper.findUserCart(req);
            if (!cart) {
                return res.status(404).json({ error: ERROR_MESSAGES.CART_NOT_FOUND });
            }

            const itemIndex = CartHelper.findCartItemIndex(cart, productId);
            if (itemIndex === -1) {
                return res.status(404).json({ error: ERROR_MESSAGES.ITEM_NOT_FOUND });
            }

            // Validate stock for new quantity
            await CartHelper.validateProductStock(productId, quantity);

            // Update item
            cart.items[itemIndex].quantity = quantity;
            cart.items[itemIndex].total = formatPrice(
                cart.items[itemIndex].price * quantity
            );

            // Update cart totals and save
            CartHelper.updateCartTotals(cart);
            await cart.save();

            res.json({ 
                success: true, 
                cart: createCartResponse(cart) 
            });

        } catch (error) {
            console.error('Error updating cart:', error);
            
            if (error.message === 'Product not found') {
                return res.status(404).json({ error: ERROR_MESSAGES.PRODUCT_NOT_FOUND });
            }
            if (error.message === 'Not enough stock available') {
                return res.status(400).json({ error: ERROR_MESSAGES.INSUFFICIENT_STOCK });
            }
            
            res.status(500).json({ error: ERROR_MESSAGES.GENERAL_ERROR });
        }
    },

    // Remove item from cart
    async removeFromCart(req, res) {
        try {
            const { productId } = req.params;
            
            const cart = await CartHelper.findUserCart(req);
            if (!cart) {
                return res.status(404).json({ error: ERROR_MESSAGES.CART_NOT_FOUND });
            }

            // Remove item
            cart.items = cart.items.filter(item => {
                const itemProductId = item.product._id ? 
                    item.product._id.toString() : 
                    item.product.toString();
                return itemProductId !== productId;
            });

            // Update cart totals and save
            CartHelper.updateCartTotals(cart);
            await cart.save();

            res.json({ 
                success: true, 
                cart: createCartResponse(cart) 
            });

        } catch (error) {
            console.error('Error removing from cart:', error);
            res.status(500).json({ error: ERROR_MESSAGES.GENERAL_ERROR });
        }
    },

    // View cart page (renders HTML)
    async viewCart(req, res) {
        try {
            let cart = await CartHelper.findUserCartWithProducts(req);
            
            if (!cart) {
                // Create empty cart structure for template
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
                error: error.message
            });
        }
    }
};

module.exports = cartController;