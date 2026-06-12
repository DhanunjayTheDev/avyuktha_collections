import { Router } from 'express';
import { protect } from '../middleware/auth';
import {
  registerPushToken,
  removePushToken,
  getNotifications,
  markAllRead,
  markRead,
} from '../controllers/notification.controller';

const router = Router();

router.use(protect);

router.post('/push-token', registerPushToken);
router.delete('/push-token', removePushToken);
router.get('/', getNotifications);
router.patch('/read-all', markAllRead);  // must be before /:id/read
router.patch('/:id/read', markRead);

export default router;
