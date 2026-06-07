import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Product from '../models/Product';
import Category from '../models/Category';
import Collection from '../models/Collection';
import { sendSuccess, sendError, getPagination } from '../utils/apiResponse';

const isObjectId = (v: string) => mongoose.Types.ObjectId.isValid(v) && v.length === 24;

export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      page, limit, sort = '-createdAt', category, collection,
      minPrice, maxPrice, search, isFeatured, isNewArrival,
      isBestSeller, isTrending, tags,
    } = req.query as Record<string, string>;

    const { page: p, limit: l, skip } = getPagination(page, limit);

    const filter: Record<string, unknown> = { isActive: true };

    // Accept category/collection as ObjectId OR slug
    if (category) {
      if (isObjectId(category)) {
        filter.category = category;
      } else {
        const cat = await Category.findOne({ slug: category }).select('_id').lean();
        if (cat) filter.category = cat._id;
        else filter.category = null; // no match → 0 results, not an error
      }
    }
    if (collection) {
      if (isObjectId(collection)) {
        filter.collections = collection;
      } else {
        const col = await Collection.findOne({ slug: collection }).select('_id').lean();
        if (col) filter.collections = col._id;
        else filter.collections = null;
      }
    }
    if (isFeatured) filter.isFeatured = isFeatured === 'true';
    if (isNewArrival) filter.isNewArrival = isNewArrival === 'true';
    if (isBestSeller) filter.isBestSeller = isBestSeller === 'true';
    if (isTrending) filter.isTrending = isTrending === 'true';
    if (tags) filter.tags = { $in: tags.split(',') };
    if (minPrice || maxPrice) {
      filter.salePrice = {};
      if (minPrice) (filter.salePrice as Record<string, unknown>).$gte = Number(minPrice);
      if (maxPrice) (filter.salePrice as Record<string, unknown>).$lte = Number(maxPrice);
    }
    if (search) filter.$text = { $search: search };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .populate('collections', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(l)
        .lean(),
      Product.countDocuments(filter),
    ]);

    sendSuccess(res, 'Products fetched', products, 200, {
      page: p, limit: l, total, pages: Math.ceil(total / l),
    });
  } catch (err) {
    next(err);
  }
};

export const getProductBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate('category', 'name slug')
      .populate('collections', 'name slug');

    if (!product) { sendError(res, 'Product not found', 404); return; }
    sendSuccess(res, 'Product fetched', product);
  } catch (err) {
    next(err);
  }
};

export const getRelatedProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true });
    if (!product) { sendError(res, 'Product not found', 404); return; }

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true,
    })
      .limit(8)
      .select('name slug images salePrice mrp discountPercentage ratings variants category')
      .populate('category', 'name slug')
      .lean();

    sendSuccess(res, 'Related products', related);
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await Product.create(req.body);
    sendSuccess(res, 'Product created', product, 201);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!product) { sendError(res, 'Product not found', 404); return; }
    sendSuccess(res, 'Product updated', product);
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) { sendError(res, 'Product not found', 404); return; }
    sendSuccess(res, 'Product deactivated');
  } catch (err) {
    next(err);
  }
};

export const uploadProductImages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files?.length) { sendError(res, 'No images uploaded', 400); return; }

    const urls = files.map((f) => (f as unknown as { path: string }).path);
    sendSuccess(res, 'Images uploaded', { urls });
  } catch (err) {
    next(err);
  }
};

export const searchProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { q, page, limit } = req.query as Record<string, string>;
    if (!q) { sendError(res, 'Search query required', 400); return; }

    const { page: p, limit: l, skip } = getPagination(page, limit);

    const [products, total] = await Promise.all([
      Product.find({ $text: { $search: q }, isActive: true }, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(l)
        .select('name slug images salePrice mrp discountPercentage ratings variants category')
        .populate('category', 'name slug')
        .lean(),
      Product.countDocuments({ $text: { $search: q }, isActive: true }),
    ]);

    sendSuccess(res, 'Search results', products, 200, {
      page: p, limit: l, total, pages: Math.ceil(total / l),
    });
  } catch (err) {
    next(err);
  }
};
