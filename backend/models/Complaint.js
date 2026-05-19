const mongoose = require('mongoose');

// ─── User Schema ───────────────────────────────────────────────────────────────
const UserSchema = new mongoose.Schema({
  name:     { type: String, required: [true, 'Name is required'], trim: true },
  email:    { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email'] },
  password: { type: String, required: [true, 'Password is required'] },
  role:     { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt:{ type: Date, default: Date.now }
});

// ─── Complaint Schema ──────────────────────────────────────────────────────────
const ComplaintSchema = new mongoose.Schema({
  name:        { type: String, required: [true, 'Name is required'], trim: true },
  email:       { type: String, required: [true, 'Email is required'], match: [/^\S+@\S+\.\S+$/, 'Invalid email'] },
  title:       { type: String, required: [true, 'Title is required'], trim: true },
  description: { type: String, required: [true, 'Description is required'] },
  category:    {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Water Supply', 'Electricity', 'Sanitation', 'Roads', 'Public Safety', 'Healthcare', 'Other']
  },
  location:    { type: String, required: [true, 'Location is required'], trim: true },
  status:      { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' },
  aiAnalysis:  {
    urgency:      { type: String, default: null },
    department:   { type: String, default: null },
    summary:      { type: String, default: null },
    autoResponse: { type: String, default: null }
  },
  createdAt: { type: Date, default: Date.now }
});

const User      = mongoose.model('User', UserSchema);
const Complaint = mongoose.model('Complaint', ComplaintSchema);

module.exports = { User, Complaint };
