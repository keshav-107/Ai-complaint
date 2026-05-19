const express  = require('express');
const bcrypt   = require('bcrypt');
const jwt      = require('jsonwebtoken');
const { User } = require('../models/Complaint');

const router = express.Router();

// ─── POST /api/auth/signup ─────────────────────────────────────────────────────
router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields are required.' });

    if (await User.findOne({ email }))
      return res.status(409).json({ success: false, message: 'Email already registered.' });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashedPassword });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) { next(err); }
});

// ─── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password are required.' });

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) { next(err); }
});

// ─── GET /api/auth/seed-admin?secret=SEED_SECRET ──────────────────────────────
// One-time route to create the admin account on Render.
// Protected by SEED_SECRET env var. Safe to call multiple times (idempotent).
router.get('/seed-admin', async (req, res, next) => {
  try {
    // Verify secret
    const { secret } = req.query;
    if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET)
      return res.status(403).json({ success: false, message: 'Invalid seed secret.' });

    // Idempotent — skip if admin already exists
    const existing = await User.findOne({ role: 'admin' });
    if (existing)
      return res.json({ success: true, message: 'Admin already exists.', email: existing.email });

    const hashed = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@1234', 12);
    const admin  = await User.create({
      name:     process.env.ADMIN_NAME     || 'Admin',
      email:    process.env.ADMIN_EMAIL    || 'admin@complaintai.com',
      password: hashed,
      role:     'admin'
    });

    res.status(201).json({
      success: true,
      message: 'Admin created successfully.',
      email:   admin.email
    });
  } catch (err) { next(err); }
});

module.exports = router;
