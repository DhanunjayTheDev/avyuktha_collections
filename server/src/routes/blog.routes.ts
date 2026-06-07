import { Router } from 'express';
import { getBlogs, getBlogBySlug, createBlog, updateBlog, deleteBlog } from '../controllers/blog.controller';
import { protect, isAdmin } from '../middleware/auth';
import { blogUpload } from '../middleware/upload';

const router = Router();

router.get('/', getBlogs);
router.get('/:slug', getBlogBySlug);
router.post('/', protect, isAdmin, blogUpload.single('coverImage'), createBlog);
router.patch('/:id', protect, isAdmin, updateBlog);
router.delete('/:id', protect, isAdmin, deleteBlog);

export default router;
