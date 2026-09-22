import express from 'express';
import Tip from '../models/Tips.js';

const router = express.Router();

// GET all tips
router.get('/', async (req, res) => {
  try {
    const tips = await Tip.find().sort({ createdAt: -1 });
    res.status(200).json(tips);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching tips' });
  }
});

// POST new tip
router.post('/', async (req, res) => {
  try {
    const { bookmaker, type, odds, matchesCount, code, price } = req.body;
    const newTip = await Tip.create({
      bookmaker,
      type,
      odds,
      matchesCount,
      code,
      price: price || 1,
      isVip: type === 'vip'
    });
    res.status(201).json(newTip);
  } catch (err) {
    res.status(500).json({ message: 'Error creating tip' });
  }
});

// DELETE a tip
router.delete('/:id', async (req, res) => {
  try {
    await Tip.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Tip deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting tip' });
  }
});

export default router;