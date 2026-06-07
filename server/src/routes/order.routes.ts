import { Router } from 'express';
import { createOrder, verifyPayment, getMyOrders, getOrderById, cancelOrder } from '../controllers/order.controller';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);
router.post('/', createOrder);
router.post('/verify-payment', verifyPayment);
router.get('/my', getMyOrders);            // must be before /:id
router.get('/:id', getOrderById);
router.patch('/:id/cancel', cancelOrder);
router.get('/verify-payment', (_, res) => res.status(405).json({ success: false, message: 'Use POST for payment verification' }));

export default router;
