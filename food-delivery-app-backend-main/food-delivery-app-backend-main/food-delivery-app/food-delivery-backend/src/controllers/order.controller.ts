import { Request, Response } from "express";
import { RowDataPacket, OkPacket } from "mysql2";
import connectDB from "../config/database";
import { Order } from "../models/order.model";

// Place new order
export const placeOrder = async (req: Request, res: Response): Promise<void> => {
  const { restaurant_id, items, total_price, delivery_address } = req.body;

  if (!restaurant_id || !items || !total_price || !delivery_address) {
    res.status(400).json({ message: "All fields are required" });
    return;
  }

  try {
    const db = await connectDB();
    const [result] = await db.execute(
      "INSERT INTO orders (restaurant_id, items, total_price, delivery_address) VALUES (?, ?, ?, ?)",
      [restaurant_id, JSON.stringify(items), total_price, delivery_address]
    );
    const insertResult = result as OkPacket;
    res.status(201).json({ message: "Order placed", orderId: insertResult.insertId });
  } catch (err) {
    res.status(500).json({ message: "Failed to place order", error: err });
  }
};

// Get order by ID
export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const db = await connectDB();
    const [rows] = await db.execute("SELECT * FROM orders WHERE id = ?", [id]);
    const orders = rows as Order[];

    if (orders.length === 0) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    res.status(200).json(orders[0]);
  } catch (err) {
    res.status(500).json({ message: "Error fetching order", error: err });
  }
};

// Update order status
export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const db = await connectDB();
    await db.execute("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
    res.status(200).json({ message: "Order status updated" });
  } catch (err) {
    res.status(500).json({ message: "Error updating status", error: err });
  }
};

// Cancel order
export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const db = await connectDB();
    const [rows] = await db.execute("SELECT status FROM orders WHERE id = ?", [id]);
    const orders = rows as RowDataPacket[];

    if (orders.length === 0) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    const currentStatus = orders[0].status;

    if (currentStatus === "Out for Delivery" || currentStatus === "Delivered") {
      res.status(400).json({ message: "Cannot cancel order at this stage" });
      return;
    }

    await db.execute("DELETE FROM orders WHERE id = ?", [id]);
    res.status(200).json({ message: "Order cancelled" });
  } catch (err) {
    res.status(500).json({ message: "Error cancelling order", error: err });
  }
};
