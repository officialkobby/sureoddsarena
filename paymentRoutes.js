import express from 'express';
import { initiateMoMoPayment, verifyPayment } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/momo', initiateMoMoPayment);
router.get('/verify/:reference', verifyPayment);

export default router;