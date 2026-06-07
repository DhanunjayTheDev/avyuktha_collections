import Razorpay from 'razorpay';
import crypto from 'crypto';

// Lazy singleton — the Razorpay SDK throws "key_id is mandatory" if the
// keys are missing at construction time. Building it on first use keeps a
// missing/optional key from crashing the whole server at import/boot.
let razorpayClient: Razorpay | null = null;
const getRazorpay = (): Razorpay => {
  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID as string,
      key_secret: process.env.RAZORPAY_KEY_SECRET as string,
    });
  }
  return razorpayClient;
};

export const createRazorpayOrder = async (amount: number, currency = 'INR', receipt: string) => {
  return getRazorpay().orders.create({
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
  getRazorpay().payments.fetch(paymentId);

export const refundRazorpayPayment = async (paymentId: string, amount: number) =>
  getRazorpay().payments.refund(paymentId, { amount: Math.round(amount * 100) });
