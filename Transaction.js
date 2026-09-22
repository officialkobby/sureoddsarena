import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  tipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tip', required: true },
  status: { type: String, enum: ['pending', 'success', 'failed'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model('Transaction', transactionSchema);