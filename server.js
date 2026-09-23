import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend files (index.html, admin.html, yamal.jpg, etc.)
app.use(express.static(__dirname));

// In-Memory Tips Array for Instant Testing
let tips = [];

// GET Live Tips
app.get('/api/tips', (req, res) => {
  res.json(tips);
});

// POST New Tip from admin.html
app.post('/api/tips', (req, res) => {
  const newTip = { _id: Date.now().toString(), ...req.body };
  tips.unshift(newTip);
  res.status(201).json(newTip);
});

// DELETE Tip
app.delete('/api/tips/:id', (req, res) => {
  tips = tips.filter(t => t._id !== req.params.id);
  res.json({ success: true });
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