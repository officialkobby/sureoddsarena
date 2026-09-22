// 1. Initiate Mobile Money Payment
export const initiateMoMoPayment = async (req, res) => {
  const { email, phoneNumber, provider, tipId } = req.body;

  try {
    const reference = `MOMO_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

    const response = await fetch('https://api.paystack.co/charge', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        amount: 1000, // 10 GHS in pesewas
        currency: 'GHS',
        mobile_money: {
          phone: phoneNumber,
          provider: provider
        },
        reference
      })
    });

    const data = await response.json();

    if (data.status) {
      return res.status(200).json({
        success: true,
        message: 'MoMo prompt sent to phone',
        reference,
        paystackData: data.data
      });
    } else {
      return res.status(400).json({
        success: false,
        message: data.message || 'Payment initiation failed.'
      });
    }
  } catch (error) {
    console.error('MoMo Error:', error);
    res.status(500).json({ success: false, message: 'Server error during payment' });
  }
};

// 2. Verify Payment
export const verifyPayment = async (req, res) => {
  const { reference } = req.params;

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    });

    const data = await response.json();

    if (data.status && data.data.status === 'success') {
      return res.status(200).json({
        success: true,
        message: 'Payment verified!',
        bookingCode: 'GH9021'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Payment pending or failed.'
      });
    }
  } catch (error) {
    console.error('Verify Error:', error);
    res.status(500).json({ success: false, message: 'Server error verifying payment' });
  }
};