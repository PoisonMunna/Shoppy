import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './backend/config/db.js';
import Product from './backend/models/Product.js';
import User from './backend/models/User.js';
import Order from './backend/models/Order.js';

// Load environment configurations
dotenv.config();

const app = express();

// Standard Middleware
app.use(cors());
app.use(express.json());

// Resolve paths for serving static files in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

// Sample premium products list (used for DB seeding & fallback sandbox mode)
const sampleProducts = [
  {
    _id: "6650a2b9d01248001d2d3a01",
    title: "Aethera Mechanical Keyboard",
    description: "Compact 75% mechanical keyboard with translucent keycaps, hot-swappable linear tactile switches, and addressable neon RGB backlighting. Premium aluminum and obsidian casing.",
    price: 189.99,
    imageUrl: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=600&q=80",
    stockCount: 15,
    category: "Peripherals",
    rating: 4.8
  },
  {
    _id: "6650a2b9d01248001d2d3a02",
    title: "Nova HUD Visor V2",
    description: "Cyberpunk HUD smart visor glasses featuring an OLED heads-up display, real-time ambient data translation, and high-fidelity bone conduction audio.",
    price: 299.99,
    imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80",
    stockCount: 8,
    category: "Wearables",
    rating: 4.9
  },
  {
    _id: "6650a2b9d01248001d2d3a03",
    title: "Helios Prism Lamp",
    description: "Holographic projection lamp capable of producing 16 million colors and casting mesmerizing fractal patterns on your room walls via customizable apps.",
    price: 89.99,
    imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
    stockCount: 22,
    category: "Gear",
    rating: 4.3
  },
  {
    _id: "6650a2b9d01248001d2d3a04",
    title: "Chronos NFC Smart Ring",
    description: "Titanium smart ring that tracks biometric health patterns, integrates contactless NFC payments, and features a glowing cyan status pulse.",
    price: 149.99,
    imageUrl: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80",
    stockCount: 30,
    category: "Wearables",
    rating: 4.6
  },
  {
    _id: "6650a2b9d01248001d2d3a05",
    title: "Obsidian Desk Mat",
    description: "Liquid-resistant textured desk mat with an integrated RGB 15W wireless charging pad and toxic-green neon circuitry detailing.",
    price: 45.99,
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80",
    stockCount: 50,
    category: "Peripherals",
    rating: 4.5
  },
  {
    _id: "6650a2b9d01248001d2d3a06",
    title: "Viper Gaming Mouse",
    description: "Ultralight wireless mouse featuring modular weights, a 26k DPI optical sensor, and electric cyan grip accents with zero-latency response.",
    price: 119.99,
    imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80",
    stockCount: 12,
    category: "Peripherals",
    rating: 4.7
  }
];

// Try to connect to Database
let dbConnected = false;

const initDb = async () => {
  try {
    await connectDB();
    dbConnected = true;
    console.log("Database connected successfully.");
    await seedProducts();
  } catch (error) {
    console.warn("==================================================");
    console.warn("WARNING: Database connection failed.");
    console.warn("Server will run in LOCAL SANDBOX MODE.");
    console.warn("Products will be served from static mock dataset.");
    console.warn("Configure MONGO_URI in .env to connect to MongoDB.");
    console.warn(`Reason: ${error.message}`);
    console.warn("==================================================");
  }
};

// Seed Database helper
const seedProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log("Database empty. Seeding initial products...");
      await Product.insertMany(sampleProducts);
      console.log("Database seeded successfully.");
    }
  } catch (error) {
    console.error("Database seeding failed:", error);
  }
};

// Start Database Initialization
initDb();

// ==========================================
// API Endpoints
// ==========================================

// Get all products
app.get('/api/products', async (req, res) => {
  if (dbConnected) {
    try {
      const products = await Product.find({});
      return res.json(products);
    } catch (error) {
      console.error("Failed to query DB, falling back to mock dataset:", error.message);
    }
  }
  res.json(sampleProducts);
});

// Add a product (for Admin)
app.post('/api/products', async (req, res) => {
  const { title, description, price, imageUrl, stockCount, category, rating } = req.body;
  try {
    if (!dbConnected) {
      return res.status(503).json({ success: false, message: 'Database offline. Cannot add product.' });
    }

    const product = await Product.create({
      title,
      description,
      price,
      imageUrl,
      stockCount,
      category,
      rating: rating || 4.5
    });

    return res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to add product.' });
  }
});

// Delete a product (for Admin)
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (!dbConnected) {
      return res.status(503).json({ success: false, message: 'Database offline. Cannot delete product.' });
    }

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.json({ success: true, message: 'Product decommissioned successfully.' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
});

// Admin Authentication (using credentials from .env)
app.post('/api/auth/admin-login', (req, res) => {
  const { username, password } = req.body;
  const envUsername = process.env.ADMIN_USERNAME;
  const envPassword = process.env.ADMIN_PASSWORD;

  if (username === envUsername && password === envPassword) {
    return res.json({
      success: true,
      role: 'admin',
      username,
      token: 'mock_jwt_token_admin_' + Date.now()
    });
  } else {
    return res.status(401).json({ success: false, message: 'Invalid override credentials.' });
  }
});

// Client Registration (saves user to MongoDB, checks duplicate email)
app.post('/api/auth/client-signup', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!dbConnected) {
      return res.status(503).json({ success: false, message: 'Database offline. Signup unavailable.' });
    }

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'This Neural ID (Email) is already registered on the grid.' });
    }

    // Create new user (User schema pre-save hook will hash the password)
    const user = await User.create({
      name,
      email,
      password
    });

    return res.status(201).json({
      success: true,
      role: 'client',
      email: user.email,
      token: 'mock_jwt_token_client_' + Date.now(),
      message: 'Node successfully registered.'
    });
  } catch (error) {
    console.error('Client signup error:', error);
    res.status(500).json({ success: false, message: error.message || 'System error during registration.' });
  }
});

// Client Authentication (resolves to DB User schema)
app.post('/api/auth/client-login', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!dbConnected) {
      return res.status(503).json({ success: false, message: 'Database offline. Login unavailable.' });
    }

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'No node found with this Neural ID (Email). Please request an access key.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password for this node ID.' });
    }

    return res.json({
      success: true,
      role: 'client',
      email: user.email,
      token: 'mock_jwt_token_client_' + Date.now()
    });
  } catch (error) {
    console.error('Client login error:', error);
    res.status(500).json({ success: false, message: 'System error during authorization.' });
  }
});

// Checkout Order Submission (creates real Order and links to User)
app.post('/api/orders', async (req, res) => {
  const { email, items, shippingAddress } = req.body;
  
  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Order must contain items.' });
  }

  try {
    if (dbConnected) {
      // Find or create User node in database
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          name: email.split('@')[0],
          email,
          password: 'defaultPassword123'
        });
      }

      // Convert items to DB schema format and adjust stock counts
      const dbItems = [];
      let calculatedTotal = 0;
      for (const item of items) {
        const product = await Product.findById(item.product._id);
        if (!product) {
          return res.status(404).json({ success: false, message: `Product ${item.product.title} not found.` });
        }
        
        if (product.stockCount < item.quantity) {
          return res.status(400).json({ success: false, message: `Insufficient stock for ${product.title}.` });
        }
        
        product.stockCount -= item.quantity;
        await product.save();

        dbItems.push({
          product: product._id,
          quantity: item.quantity,
          price: product.price
        });
        calculatedTotal += product.price * item.quantity;
      }

      // Create Order document
      const order = await Order.create({
        user: user._id,
        items: dbItems,
        totalAmount: calculatedTotal,
        paymentStatus: 'Paid',
        status: 'Processing',
        shippingAddress: shippingAddress || {
          street: '100 Neural Boulevard',
          city: 'Neo-Obsidian',
          postalCode: '94043',
          country: 'Grid'
        }
      });

      return res.json({ success: true, orderId: order._id, total: order.totalAmount });
    } else {
      // Sandbox fallback order creation
      return res.json({ success: true, orderId: 'sandbox_order_' + Date.now(), total: items.reduce((acc, i) => acc + i.product.price * i.quantity, 0) });
    }
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ success: false, message: 'Error processing order transaction.' });
  }
});

// Fetch all Client Orders (for Admin Panel)
app.get('/api/admin/orders', async (req, res) => {
  try {
    if (!dbConnected) {
      // Return sandbox dummy data if offline
      const sandboxOrders = [
        {
          _id: 'sandbox_order_001',
          user: { name: 'client_john', email: 'john@net.com' },
          items: [
            { product: { title: 'Aethera Mechanical Keyboard' }, quantity: 1, price: 189.99 }
          ],
          totalAmount: 189.99,
          paymentStatus: 'Paid',
          status: 'Processing',
          createdAt: new Date()
        }
      ];
      return res.json(sandboxOrders);
    }

    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate('items.product', 'title imageUrl')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve database transaction list.' });
  }
});

// Serve frontend SPA (Fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} to view the store.`);
});
