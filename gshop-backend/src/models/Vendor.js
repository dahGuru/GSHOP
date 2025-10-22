import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  storeName: {
    type: String,
    required: [true, "Store name is required"],
    trim: true,
  },
  description: String,
  logo: String,
  address: {
    type: String,
    required: true,
  },
  phone: String,
  category: {
    type: String,
    enum: ["food", "grocery", "pharmacy", "others"],
    default: "food",
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    default: 0,
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Vendor = mongoose.model("Vendor", vendorSchema);
export default Vendor;
