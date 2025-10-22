// gshop-vendor/services/socket.js
import { io } from "socket.io-client";
import * as SecureStore from "expo-secure-store";
import { SOCKET_URL } from "../constants/config"; // e.g. "http://192.168.x.y:5000"

let socket;

export const connectSocket = async () => {
  const token = await SecureStore.getItemAsync("token"); // your stored JWT
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket"],
    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("connect_error", (err) => {
    console.warn("Socket error:", err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) socket.disconnect();
};

export const joinOrderRoom = (orderId) => {
  if (!socket) return;
  socket.emit("joinOrder", { orderId });
};

export const listenToOrderUpdates = (cb) => {
  if (!socket) return;
  socket.on("order:update", cb);
  socket.on("order:created", cb);
  socket.on("order:new", cb);
};

export const emitDriverLocation = ({ orderId, driverId, lat, lng }) => {
  if (!socket) return;
  socket.emit("driver:location", { orderId, driverId, lat, lng });
};

export default socket;
