import { Router } from 'express';
import { getProductReviews, createReview, approveReview, deleteReview, getAllReviews } from '../controllers/review.controller';
import { protect, isAdminOrManager } from '../middleware/auth';

const router = Router();

router.get('/admin/all', protect, isAdminOrManager, getAllReviews);
router.get('/product/:productId', getProductReviews);
router.post('/', protect, createReview);
router.patch('/:id/approve', protect, isAdminOrManager, approveReview);
router.delete('/:id', protect, isAdminOrManager, deleteReview);

export default router;
