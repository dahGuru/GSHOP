import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { placeOrder, updateOrderStatus } from "../controllers/orderController.js";

const router = express.Router();

router.post("/", protect, authorizeRoles("customer"), placeOrder);
router.patch("/:orderId/status", protect, authorizeRoles("vendor", "admin"), updateOrderStatus);

export default router;
