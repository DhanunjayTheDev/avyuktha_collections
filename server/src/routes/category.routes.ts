import { Router } from 'express';
import {
  getCategories, getCategoryBySlug, createCategory, updateCategory, deleteCategory,
  getCollections, createCollection, updateCollection, deleteCollection,
} from '../controllers/category.controller';
import { protect, isAdminOrManager } from '../middleware/auth';

const router = Router();

router.get('/categories', getCategories);
router.get('/categories/:slug', getCategoryBySlug);
router.post('/categories', protect, isAdminOrManager, createCategory);
router.patch('/categories/:id', protect, isAdminOrManager, updateCategory);
router.delete('/categories/:id', protect, isAdminOrManager, deleteCategory);

router.get('/collections', getCollections);
router.post('/collections', protect, isAdminOrManager, createCollection);
router.patch('/collections/:id', protect, isAdminOrManager, updateCollection);
router.delete('/collections/:id', protect, isAdminOrManager, deleteCollection);

export default router;
