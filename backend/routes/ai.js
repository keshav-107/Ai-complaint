const express                  = require('express');
const { GoogleGenerativeAI }   = require('@google/generative-ai');
const { protect }              = require('../middleware');
const { Complaint }            = require('../models/Complaint');

const router = express.Router();

// ─── POST /api/ai/analyze ──────────────────────────────────────────────────────
router.post('/analyze', protect, async (req, res, next) => {
  try {
    const { complaintId, title, description, category } = req.body;
    if (!title || !description || !category)
      return res.status(400).json({ success: false, message: 'title, description, and category are required.' });

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-05-20' });

    const prompt = `
You are an AI system for a government complaint tracking portal.
Analyze the complaint below and return ONLY a valid JSON object with no markdown or extra text.

Complaint Title: ${title}
Category: ${category}
Description: ${description}

Return exactly this JSON structure:
{
  "urgency": "<Low|Medium|High|Critical>",
  "department": "<relevant government department name>",
  "summary": "<2 concise sentences summarizing the complaint>",
  "autoResponse": "<polite 2-3 sentence automated reply to the complainant>"
}`;

    const result   = await model.generateContent(prompt);
    const rawText  = result.response.text().trim();
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('AI returned an unreadable response. Please try again.');

    const aiData = JSON.parse(jsonMatch[0]);

    // Persist AI analysis to the complaint document if ID provided
    if (complaintId) {
      await Complaint.findByIdAndUpdate(complaintId, { aiAnalysis: aiData });
    }

    res.json({ success: true, data: aiData });
  } catch (err) { next(err); }
});

module.exports = router;
