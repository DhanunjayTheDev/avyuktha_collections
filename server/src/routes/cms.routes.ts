import { Router } from 'express';
import { getCmsPage, upsertCmsPage, listCmsPages } from '../controllers/cms.controller';
import { protect, isAdmin } from '../middleware/auth';

const router = Router();

router.get('/', protect, isAdmin, listCmsPages);
router.get('/:key', getCmsPage);
router.put('/:key', protect, isAdmin, upsertCmsPage);

export default router;
