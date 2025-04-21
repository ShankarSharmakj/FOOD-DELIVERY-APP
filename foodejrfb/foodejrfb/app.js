require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Enable CORS for Angular frontend
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

app.use(bodyParser.json());

// MySQL DB connection pool
let db;

// Initialize DB connection function
const initializeDB = async () => {
  try {
    db = await mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // Test the connection
    await db.getConnection();
    console.log("✅ Successfully connected to the database!");

    // Start server only after successful DB connection
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to the database:", err.message);
    process.exit(1); // Exit the process if DB connection fails
  }
};

// Root Route for health check
app.get('/', (req, res) => {
  res.send('✅ Restaurant API is running');
});

// --- API Routes ---

// Get all restaurants
app.get('/api/restaurants', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM restaurants');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get restaurant by ID
app.get('/api/restaurants/:id', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM restaurants WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get menu items for a restaurant
app.get('/api/restaurants/:id/menu', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM menu_items WHERE restaurant_id = ?', [req.params.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Get all restaurants
app.get('/api/orders', async (req, res) => {
    try {
      const [rows] = await db.execute('SELECT * FROM orders');
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// Create an order
app.post('/api/orders', async (req, res) => {
  const { customer_name, restaurant_id, items, status } = req.body;

  // Log the received request data
  console.log("Creating order with data:", req.body);

  try {
    // Insert the order into the database
    const [result] = await db.execute(
      'INSERT INTO orders (customer_name, restaurant_id, items, status) VALUES (?, ?, ?, ?)',
      [customer_name, restaurant_id, JSON.stringify(items), status]
    );

    // Fetch the newly created order
    const [order] = await db.execute('SELECT * FROM orders WHERE id = ?', [result.insertId]);

    // Log the created order
    console.log("Order created successfully:", order[0]);

    // Return the created order as the response
    res.status(201).json(order[0]);
  } catch (err) {
    console.error("Error creating order:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get order by ID
app.get('/api/orders/:id', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update order status
app.put('/api/orders/:id', async (req, res) => {
  const { status } = req.body;
  try {
    await db.execute('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    const [updated] = await db.execute('SELECT * FROM orders WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel order
app.delete('/api/orders/:id', async (req, res) => {
  try {
    await db.execute('DELETE FROM orders WHERE id = ?', [req.params.id]);
    res.json({ message: 'Order cancelled successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- 404 Fallback for undefined routes ---
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize DB connection and start the server
initializeDB();
