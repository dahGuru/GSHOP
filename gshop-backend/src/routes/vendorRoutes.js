import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { addProduct, getVendorOrders } from "../controllers/vendorController.js";

const router = express.Router();

router.post("/products", protect, authorizeRoles("vendor"), addProduct);
router.get("/orders", protect, authorizeRoles("vendor"), getVendorOrders);

export default router;
