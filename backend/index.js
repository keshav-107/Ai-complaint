require('dotenv').config();
const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');

const authRoutes      = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const aiRoutes        = require('./routes/ai');
const { errorHandler } = require('./middleware');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Core Middleware ───────────────────────────────────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/ai',         aiRoutes);

// Health check
app.get('/', (req, res) => res.json({ message: '🚀 Complaint Tracker API is running.' }));

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Database + Server ────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
