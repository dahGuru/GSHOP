import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  name: {
    type: String,
    required: [true, "Product name is required"],
  },
  description: String,
  image: String,
  price: {
    type: Number,
    required: [true, "Price is required"],
  },
  stock: {
    type: Number,
    default: 0,
  },
  category: {
    type: String,
    enum: ["food", "drink", "grocery", "others"],
    default: "food",
  },
  available: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model("Product", productSchema);
export default Product;
