import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

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
    
    // Mask code for VIP tips to protect unpaid content
    const sanitizedTips = tips.map(tip => {
      const tipObj = tip.toObject();
      if (tipObj.type === 'vip' || tipObj.isVip) {
        tipObj.code = '🔒 LOCKED';
      }
      return tipObj;
    });

    res.json(sanitizedTips);
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

// --- PAYSTACK MOMO PAYMENT ROUTES ---

// Initialize Paystack MoMo Payment
app.post('/api/paystack/initialize', async (req, res) => {
  const { email, phone, amount, ticketId } = req.body;

  if (!process.env.PAYSTACK_SECRET_KEY) {
    return res.status(500).json({ status: false, error: 'PAYSTACK_SECRET_KEY is missing on server.' });
  }

  try {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: email || `momo_${phone}@sureoddsarena.com`,
        amount: Math.round(Number(amount) * 100), // GHS to Pesewas
        currency: 'GHS',
        channels: ['mobile_money'],
        metadata: {
          ticketId: ticketId,
          phone: phone
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Paystack Initialize Error:', error.response?.data || error.message);
    res.status(500).json({
      status: false,
      error: error.response?.data?.message || 'Payment initialization failed'
    });
  }
});

// Verify Paystack Payment
app.get('/api/paystack/verify/:reference', async (req, res) => {
  const { reference } = req.params;

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const transactionData = response.data.data;

    if (transactionData.status === 'success') {
      const ticketId = transactionData.metadata?.ticketId;
      let unlockedCode = null;

      if (ticketId && mongoose.Types.ObjectId.isValid(ticketId)) {
        const ticket = await Tip.findById(ticketId);
        if (ticket) unlockedCode = ticket.code;
      }

      res.json({
        status: 'success',
        message: 'Payment verified successfully',
        code: unlockedCode,
        reference: reference
      });
    } else {
      res.status(400).json({ status: 'failed', message: 'Payment failed or pending' });
    }
  } catch (error) {
    console.error('Paystack Verify Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Default Route -> Serves index.html when visiting base URL
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Use Render's assigned port or fallback to 5002
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
