const express        = require('express');
const { Complaint }  = require('../models/Complaint');
const { protect }    = require('../middleware');

const router = express.Router();

// ─── POST /api/complaints ──────────────────────────────────────────────────────
router.post('/', protect, async (req, res, next) => {
  try {
    const { name, email, title, description, category, location } = req.body;
    if (!name || !email || !title || !description || !category || !location)
      return res.status(400).json({ success: false, message: 'All fields are required.' });

    const complaint = await Complaint.create({ name, email, title, description, category, location });
    res.status(201).json({ success: true, message: 'Complaint submitted successfully.', data: complaint });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors).map(e => e.message).join(', ');
      return res.status(400).json({ success: false, message: msg });
    }
    next(err);
  }
});

// ─── GET /api/complaints/search?location=... ───────────────────────────────────
// NOTE: must be before /:id to avoid route conflict
router.get('/search', protect, async (req, res, next) => {
  try {
    const { location } = req.query;
    if (!location)
      return res.status(400).json({ success: false, message: 'location query param required.' });

    const complaints = await Complaint.find({ location: { $regex: location, $options: 'i' } }).sort({ createdAt: -1 });
    res.json({ success: true, count: complaints.length, data: complaints });
  } catch (err) { next(err); }
});

// ─── GET /api/complaints ───────────────────────────────────────────────────────
router.get('/', protect, async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    if (req.query.status)   filter.status   = req.query.status;

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: complaints.length, data: complaints });
  } catch (err) { next(err); }
});

// ─── GET /api/complaints/:id ───────────────────────────────────────────────────
router.get('/:id', protect, async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint)
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    res.json({ success: true, data: complaint });
  } catch (err) { next(err); }
});

// ─── PUT /api/complaints/:id ───────────────────────────────────────────────────
router.put('/:id', protect, async (req, res, next) => {
  try {
    const update = {};
    if (req.body.status)     update.status     = req.body.status;
    if (req.body.aiAnalysis) update.aiAnalysis = req.body.aiAnalysis;

    const complaint = await Complaint.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
    if (!complaint)
      return res.status(404).json({ success: false, message: 'Complaint not found.' });

    res.json({ success: true, message: 'Complaint updated.', data: complaint });
  } catch (err) { next(err); }
});

// ─── DELETE /api/complaints/:id ───────────────────────────────────────────────
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint)
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    res.json({ success: true, message: 'Complaint deleted successfully.' });
  } catch (err) { next(err); }
});

module.exports = router;
