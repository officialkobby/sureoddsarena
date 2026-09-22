import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

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

const PORT = 5002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});