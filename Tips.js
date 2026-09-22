import mongoose from 'mongoose';

const tipSchema = new mongoose.Schema({
  bookmaker: { type: String, required: true },
  type: { type: String, default: 'free' },
  odds: { type: String, required: true },
  matchesCount: { type: String, required: true },
  code: { type: String, required: true },
  price: { type: Number, default: 1 },
  isVip: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Tip', tipSchema);