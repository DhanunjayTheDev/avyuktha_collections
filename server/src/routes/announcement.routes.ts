import { Router } from 'express';
import {
  getActiveAnnouncements, trackAnnouncementClick,
  createAnnouncement, updateAnnouncement, deleteAnnouncement, getAnnouncements,
} from '../controllers/announcement.controller';
import { protect, isAdminOrManager } from '../middleware/auth';

const router = Router();

router.get('/active', getActiveAnnouncements);
router.post('/:id/click', trackAnnouncementClick);
router.get('/', protect, isAdminOrManager, getAnnouncements);
router.post('/', protect, isAdminOrManager, createAnnouncement);
router.patch('/:id', protect, isAdminOrManager, updateAnnouncement);
router.delete('/:id', protect, isAdminOrManager, deleteAnnouncement);

export default router;
