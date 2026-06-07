import { Router } from 'express';
import {
  getProducts, getProductBySlug, getRelatedProducts,
  createProduct, updateProduct, deleteProduct,
  uploadProductImages, searchProducts,
} from '../controllers/product.controller';
import { protect, isAdminOrManager } from '../middleware/auth';
import { productUpload } from '../middleware/upload';

const router = Router();

router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/:slug', getProductBySlug);
router.get('/:slug/related', getRelatedProducts);

router.post('/', protect, isAdminOrManager, createProduct);
router.patch('/:id', protect, isAdminOrManager, updateProduct);
router.delete('/:id', protect, isAdminOrManager, deleteProduct);
router.post('/upload/images', protect, isAdminOrManager, productUpload.array('images', 10), uploadProductImages);

export default router;
