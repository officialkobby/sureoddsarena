import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend files (index.html, admin.html, yamal.jpg, etc.)
app.use(express.static(__dirname));

// --- MONGODB CONNECTION ---
const MONGO_URI = process.env.MONGO_URI || "YOUR_MONGODB_ATLAS_CONNECTION_STRING_HERE";

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB Database successfully!'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// --- MONGOOSE TICKETS SCHEMA & MODEL ---
const tipSchema = new mongoose.Schema({
  bookmaker: { type: String, required: true },
  type: { type: String, required: true },
  odds: { type: String, required: true },
  matchesCount: { type: String, required: true },
  code: { type: String, required: true },
  price: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

const Tip = mongoose.model('Tip', tipSchema);

// --- API ROUTES ---

// GET Live Tips from MongoDB
app.get('/api/tips', async (req, res) => {
  try {
    const tips = await Tip.find().sort({ createdAt: -1 });
    res.json(tips);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tips' });
  }
});

// POST New Tip to MongoDB
app.post('/api/tips', async (req, res) => {
  try {
    const newTip = new Tip(req.body);
    await newTip.save();
    res.status(201).json(newTip);
  } catch (err) {
    res.status(400).json({ error: 'Failed to save tip' });
  }
});

// DELETE Tip from MongoDB
app.delete('/api/tips/:id', async (req, res) => {
  try {
    await Tip.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete tip' });
  }
});

// Default Route -> Serves index.html when visiting the base URL
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Use Render's assigned port or fallback to 5002
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
