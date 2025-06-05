const mongoose = require('mongoose');
const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, default: 1 }
    }],
    totalAmount: {
        type: Number,
        required: true,
    },
    orderStatus: {
        type: String,
        enum: ['Pending', 'Confirmed'],
        required: true,
        default: 'Pending',
    },
    OrderID: {
        type: Number,
        required: true,
        unique: true,
    },
    OrderDate: {
        type: Date,
        default: Date.now,
    },
    ShippingAddress: {
        type: String,
        required: true,
    },
    ContactNumber: {
        type: String,
        required: true,
    },
    PaymentMethod: {
        type: String,
        enum: ['Cash on Delivery'],
        required: true,
    },
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
});
module.exports = mongoose.model('Order', OrderSchema);