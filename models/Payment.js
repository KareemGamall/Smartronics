const mongoose = require("mongoose");
const PaymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["Credit Card", "PayPal", "Bank Transfer"], // Add more payment methods as needed
    },
    amount: { type: Number, required: true }, // Total amount paid
    transactionId: { type: String, required: true, unique: true }, // Unique transaction identifier
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Completed", "Failed"], // Add more statuses as needed
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);
module.exports = mongoose.model("Payment", PaymentSchema);
