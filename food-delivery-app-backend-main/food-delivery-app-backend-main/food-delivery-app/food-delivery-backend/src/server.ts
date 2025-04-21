import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import restaurantRoutes from "./routes/restaurant.router";
import orderRoutes from "./routes/order.router";
import connectDB from "./config/database";

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Application = express();
const PORT = process.env.PORT || 3306;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to DB
connectDB();

// Routes
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/orders", orderRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("🍔 Food Delivery API is running...");
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

