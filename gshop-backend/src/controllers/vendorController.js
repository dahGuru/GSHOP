import Vendor from "../models/Vendor.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";

// Vendor creates a new product
export const addProduct = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ owner: req.user._id });
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const product = await Product.create({ ...req.body, vendor: vendor._id });
    vendor.products.push(product._id);
    await vendor.save();

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Vendor gets all their orders
export const getVendorOrders = async (req, res) => {
  try {
    const vendor = await Vendor.findOne({ owner: req.user._id });
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const orders = await Order.find({ vendor: vendor._id }).populate("user", "fullName email");
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getVendorDashboard = async (req, res) => {
  res.json({ message: `Welcome ${req.user.name}, this is your vendor dashboard` });
};
