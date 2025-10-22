// src/config/socket.js
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Vendor from "../models/Vendor.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      methods: ["GET", "POST", "PATCH"],
    },
  });

  io.use(async (socket, next) => {
    try {
      // token can be sent via auth object: socket.auth = { token }
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(); // allow unauthenticated sockets if needed (but no rooms)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // { id, role }
      // attach basic user info
      const user = await User.findById(decoded.id).select("role fullName email");
      socket.user.role = user?.role || decoded.role;
      socket.user.name = user?.fullName || user?.email;

      // If vendor, find vendor profile and auto-join vendor room
      if (socket.user.role === "vendor") {
        const vendor = await Vendor.findOne({ owner: decoded.id }).select("_id");
        if (vendor) {
          socket.vendorId = vendor._id.toString();
          socket.join(`vendor_${socket.vendorId}`);
        }
      }

      // All authenticated sockets join a user room
      socket.join(`user_${decoded.id}`);

      return next();
    } catch (err) {
      // invalid token => continue without attaching user (you can reject if desired)
      return next();
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id, "user:", socket.user?.id || "anon");

    // allow client to join an order room explicitly
    socket.on("joinOrder", ({ orderId }) => {
      if (!orderId) return;
      socket.join(`order_${orderId}`);
    });

    // driver joins an order room: { orderId, driverId }
    socket.on("driver:join", ({ orderId, driverId }) => {
      if (!orderId || !driverId) return;
      socket.driverId = driverId;
      socket.join(`order_${orderId}`);
      // optionally also join vendor/user rooms depending on logic
    });

    // driver sends location updates
    socket.on("driver:location", ({ orderId, lat, lng }) => {
      if (!orderId) return;
      // broadcast to order room (users & vendor listening)
      io.to(`order_${orderId}`).emit("driver:location", { orderId, lat, lng, timestamp: Date.now() });
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", socket.id, reason);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
