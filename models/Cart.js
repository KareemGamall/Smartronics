const mongoose = require('mongoose');
const CartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, default: 1 },
        price: { type: Number, required: true }, // Price at the time of adding to cart
        total: { type: Number, required: true }, // Total price for this item (quantity * price)
    }],
    totalAmount: { type: Number, required: true, default: 0 }, // Total amount for the cart
    CartID: {
        type: Number,
        required: true,
        unique: true,}
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
});
module.exports = mongoose.model('Cart', CartSchema);