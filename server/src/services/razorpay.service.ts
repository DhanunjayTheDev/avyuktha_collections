import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export const createRazorpayOrder = async (amount: number, currency = 'INR', receipt: string) => {
  return razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency,
    receipt,
  });
};

export const verifyRazorpaySignature = (
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string
): boolean => {
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET as string)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
};

export const fetchRazorpayPayment = async (paymentId: string) =>
  razorpay.payments.fetch(paymentId);

export const refundRazorpayPayment = async (paymentId: string, amount: number) =>
  razorpay.payments.refund(paymentId, { amount: Math.round(amount * 100) });
