const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    imageUrl: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: [0, 'Stock quantity cannot be negative'],
      default: 0,
    },
    ProductID: {
      type: Number,
      unique: true,
      default: function() {
        return Math.floor(Math.random() * 1000000); // Generate a random 6-digit number
      }
    },
  },
  {
    timestamps: true,
  }
);

// Add a pre-save middleware to ensure unique ProductID
ProductSchema.pre('save', async function(next) {
  if (this.isNew) {
    let isUnique = false;
    while (!isUnique) {
      const randomId = Math.floor(Math.random() * 1000000);
      const existingProduct = await this.constructor.findOne({ ProductID: randomId });
      if (!existingProduct) {
        this.ProductID = randomId;
        isUnique = true;
      }
    }
  }
  next();
});

module.exports = mongoose.model("Product", ProductSchema);
