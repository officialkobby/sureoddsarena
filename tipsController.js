import Tip from '../models/Tip.js';

// Get Free Tips (Codes are publicly visible)
export const getFreeTips = async (req, res) => {
  try {
    const freeTips = await Tip.find({ isVip: false }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, tips: freeTips });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch free tips' });
  }
};

// Get VIP Tips List (Codes are hidden until payment verification)
export const getVipTips = async (req, res) => {
  try {
    const vipTips = await Tip.find({ isVip: true }).sort({ createdAt: -1 }).select('-code');
    res.status(200).json({ success: true, tips: vipTips });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch VIP tips' });
  }
};

// Admin: Post New Booking Code
export const createTip = async (req, res) => {
  try {
    const newTip = await Tip.create(req.body);
    res.status(201).json({ success: true, data: newTip });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};