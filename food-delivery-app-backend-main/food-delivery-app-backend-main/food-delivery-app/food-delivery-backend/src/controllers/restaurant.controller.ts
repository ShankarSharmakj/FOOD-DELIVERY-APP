import { Request, Response } from "express";
import { RowDataPacket } from "mysql2";
import connectDB from "../config/database"; // 🔁 renamed from db to connectDB
import { Restaurant } from "../models/restaurant.model";

// Get all restaurants
export const getAllRestaurants = async (req: Request, res: Response): Promise<void> => {
  try {
    const db = await connectDB(); // ✅ Get connection object
    const [rows] = await db.execute("SELECT * FROM restaurants ORDER BY name");
    const restaurants = rows as Restaurant[];
    res.json(restaurants);
  } catch (error) {
    res.status(500).json({ message: "Error fetching restaurants", error });
  }
};

// Get restaurant by ID
export const getRestaurantById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const db = await connectDB(); // ✅ Again, get the connection first
    const [rows] = await db.execute("SELECT * FROM restaurants WHERE id = ?", [id]);
    const restaurants = rows as Restaurant[];

    if (restaurants.length === 0) {
      res.status(404).json({ message: "Restaurant not found" });
      return;
    }

    res.json(restaurants[0]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching restaurant details", error });
  }
};
