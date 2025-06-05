const mongoose = require('mongoose');
const OrderItemSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, default: 1 },
    price: { type: Number, required: true }, // Price at the time of order
    total: { type: Number, required: true }, // Total price for this item (quantity * price)

}, {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
});
module.exports = mongoose.model('OrderItem', OrderItemSchema);