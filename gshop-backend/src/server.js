import dotenv from "dotenv";
import { createServer } from "http";
// import { Server } from "socket.io";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import { initSocket } from "./config/socket.js";


dotenv.config();

// Create HTTP server
const server = createServer(app);

// Setup Socket.IO
const io = initSocket(server, {
  cors: { origin: "*" },
});

// const io = initSocket(server);

// Listen for connections
io.on("connection", (socket) => {
  console.log("⚡ New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// Connect Database and Start Server
const PORT = process.env.PORT || 5000;
connectDB();

server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// Export io instance globally (optional)
export { io };
