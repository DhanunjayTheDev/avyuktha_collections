import mongoose, { Schema } from 'mongoose';
import slugify from 'slugify';
import { IProduct } from '../types';

const variantSchema = new Schema(
  {
    color: String,
    size: String,
    fabric: String,
    pattern: String,
    sku: { type: String, required: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: [String],
  },
  { _id: true }
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    shortDescription: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    subcategory: String,
    collections: [{ type: Schema.Types.ObjectId, ref: 'Collection' }],
    mrp: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, required: true, min: 0 },
    discountPercentage: { type: Number, default: 0 },
    variants: [variantSchema],
    images: { type: [String], required: true },
    videos: [String],
    tags: [String],
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    metaTitle: String,
    metaDescription: String,
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

productSchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  if (this.isModified('mrp') || this.isModified('salePrice')) {
    this.discountPercentage =
      this.mrp > 0 ? Math.round(((this.mrp - this.salePrice) / this.mrp) * 100) : 0;
  }
  next();
});

productSchema.index({ category: 1 });
productSchema.index({ collections: 1 });
productSchema.index({ isActive: 1, isFeatured: 1 });
productSchema.index({ isActive: 1, isNewArrival: 1 });
productSchema.index({ isActive: 1, isBestSeller: 1 });
productSchema.index({ isActive: 1, isTrending: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

export default mongoose.model<IProduct>('Product', productSchema);
