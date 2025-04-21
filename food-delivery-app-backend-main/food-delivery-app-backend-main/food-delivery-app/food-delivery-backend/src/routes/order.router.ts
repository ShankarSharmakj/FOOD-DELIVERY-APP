import { Router } from "express";
import {
  placeOrder,
  getOrderById,
  updateOrderStatus,
  cancelOrder
} from "../controllers/order.controller";

const router = Router();

router.post("/", placeOrder);
router.get("/:id", getOrderById);
router.put("/:id", updateOrderStatus);
router.delete("/:id", cancelOrder);

export default router;
