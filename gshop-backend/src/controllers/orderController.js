// src/controllers/orderController.js
import Order from "../models/Order.js";
import Vendor from "../models/Vendor.js";
import Product from "../models/Product.js";
import { getIO } from "../config/socket.js";

// Place order (user)
export const placeOrder = async (req, res) => {
  try {
    const { vendorId, items, deliveryAddress } = req.body;

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const order = await Order.create({
      user: req.user._id,
      vendor: vendor._id,
      items,
      deliveryAddress,
      totalAmount,
    });

    // Emit real-time event to vendor and user
    try {
      const io = getIO();
      // vendor room
      io.to(`vendor_${vendor._id.toString()}`).emit("order:new", {
        orderId: order._id,
        vendorId: vendor._id,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt,
      });
      // user room
      io.to(`user_${req.user._id.toString()}`).emit("order:created", {
        orderId: order._id,
        status: order.status,
      });
      // join order room (optional) — broadcast to order room too
      io.to(`order_${order._id.toString()}`).emit("order:info", { order });
    } catch (err) {
      console.error("Socket emit error:", err.message);
    }

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update order status (vendor only)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    // Broadcast update to order room, vendor room, and user room
    try {
      const io = getIO();
      io.to(`order_${order._id.toString()}`).emit("order:update", { orderId: order._id, status });
      io.to(`user_${order.user.toString()}`).emit("order:update", { orderId: order._id, status });
      io.to(`vendor_${order.vendor.toString()}`).emit("order:update", { orderId: order._id, status });
    } catch (err) {
      console.error("Socket emit error:", err.message);
    }

    res.status(200).json({ success: true, message: "Order status updated", data: order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
