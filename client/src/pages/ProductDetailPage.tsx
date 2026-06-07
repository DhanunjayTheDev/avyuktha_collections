import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Truck, RotateCcw, Shield, Star, ChevronLeft, ChevronRight, ZoomIn, Minus, Plus } from 'lucide-react';
import Breadcrumb from '../components/common/Breadcrumb';
import ProductRow from '../components/home/ProductRow';
import Spinner from '../components/common/Spinner';
import { productApi } from '../api/product.api';
import { reviewApi } from '../api/misc.api';
import type { Product, ProductVariant, Review } from '../types';
import { formatPrice, formatDate } from '../utils/format';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<'description' | 'reviews' | 'shipping'>('description');
  const [zoom, setZoom] = useState(false);

  const { isAuthenticated } = useAuthStore();
  const { addItem, isLoading: cartLoading } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([
      productApi.getProductBySlug(slug),
      productApi.getRelatedProducts(slug),
    ]).then(([pd, rel]) => {
      const p: Product = pd.data.data;
      setProduct(p);
      setRelated(rel.data.data || []);
      setSelectedVariant(p.variants[0] || null);
    }).catch(() => navigate('/products')).finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (product?._id) {
      reviewApi.getProductReviews(product._id).then(({ data }) => setReviews(data.data || [])).catch(() => {});
    }
  }, [product?._id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  if (!product) return null;

  const images = selectedVariant?.images?.length ? selectedVariant.images : product.images;
  const hasStock = selectedVariant ? selectedVariant.stock > 0 : false;
  const wishlisted = isWishlisted(product._id);

  const uniqueSizes = [...new Set(product.variants.map((v) => v.size).filter(Boolean))];
  const uniqueColors = [...new Set(product.variants.map((v) => v.color).filter(Boolean))];

  const handleAddToCart = async () => {
    if (!isAuthenticated) { navigate('/auth/login'); return; }
    if (!selectedVariant) { toast.error('Please select a variant'); return; }
    await addItem(product._id, selectedVariant.sku, qty);
  };

  return (
    <div className="min-h-screen bg-brand-bg" style={{ paddingTop: "var(--topbar-height)" }}>
      <div className="container-custom py-8">
        <Breadcrumb crumbs={[
          { label: 'Home', href: '/' },
          { label: product.category?.name || 'Products', href: `/products?category=${product.category?.slug}` },
          { label: product.name },
        ]} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-8">
          {/* Gallery */}
          <div className="flex gap-3">
            {/* Thumbnails */}
            <div className="hidden md:flex flex-col gap-2 w-20 flex-shrink-0">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`aspect-[3/4] overflow-hidden border-2 transition-colors ${
                    i === imgIdx ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>

            {/* Main image */}
            <div className="flex-1 relative">
              <div
                className="relative aspect-[3/4] overflow-hidden bg-brand-surface cursor-zoom-in"
                onClick={() => setZoom(true)}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={imgIdx}
                    src={images[imgIdx]}
                    alt={product.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
                <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 flex items-center justify-center hover:bg-white">
                  <ZoomIn size={16} />
                </button>
                {product.discountPercentage > 0 && (
                  <div className="absolute top-3 left-3 bg-primary text-white font-body text-xs px-2 py-1 tracking-widest uppercase">
                    -{product.discountPercentage}%
                  </div>
                )}
              </div>

              {/* Mobile nav */}
              {images.length > 1 && (
                <div className="md:hidden absolute inset-y-0 flex items-center justify-between px-2 pointer-events-none w-full">
                  <button onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)} className="pointer-events-auto w-8 h-8 bg-white/80 flex items-center justify-center">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={() => setImgIdx((i) => (i + 1) % images.length)} className="pointer-events-auto w-8 h-8 bg-white/80 flex items-center justify-center">
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="lg:py-4">
            <p className="font-body text-sm text-brand-muted mb-2">{product.category?.name}</p>
            <h1 className="heading-sm text-brand-text mb-3">{product.name}</h1>

            {/* Rating */}
            {product.ratings.count > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={14} className={s <= Math.round(product.ratings.average) ? 'text-primary fill-primary' : 'text-brand-border'} />
                  ))}
                </div>
                <span className="font-body text-sm text-brand-muted">{product.ratings.average} ({product.ratings.count} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-brand-border">
              <span className="font-heading text-3xl font-bold text-brand-text">{formatPrice(product.salePrice)}</span>
              {product.mrp > product.salePrice && (
                <>
                  <span className="font-body text-lg text-brand-muted line-through">{formatPrice(product.mrp)}</span>
                  <span className="font-body text-sm bg-green-100 text-green-700 px-2 py-0.5 font-medium">
                    {product.discountPercentage}% off
                  </span>
                </>
              )}
            </div>

            {/* Colors */}
            {uniqueColors.length > 0 && (
              <div className="mb-5">
                <p className="input-label">
                  Color: <span className="text-brand-muted font-normal">{selectedVariant?.color}</span>
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {uniqueColors.map((color) => {
                    const v = product.variants.find((va) => va.color === color);
                    return (
                      <button
                        key={color}
                        onClick={() => v && setSelectedVariant(v)}
                        className={`px-4 py-2 font-body text-sm border-2 transition-colors ${
                          selectedVariant?.color === color
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-brand-border hover:border-primary/50'
                        } ${v && v.stock === 0 ? 'opacity-40 line-through' : ''}`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sizes */}
            {uniqueSizes.length > 0 && (
              <div className="mb-6">
                <p className="input-label">
                  Size: <span className="text-brand-muted font-normal">{selectedVariant?.size}</span>
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {uniqueSizes.map((size) => {
                    const v = product.variants.find((va) => va.size === size && va.color === selectedVariant?.color) ||
                              product.variants.find((va) => va.size === size);
                    return (
                      <button
                        key={size}
                        onClick={() => v && setSelectedVariant(v)}
                        className={`w-12 h-12 font-body text-sm border-2 transition-colors ${
                          selectedVariant?.size === size
                            ? 'border-primary bg-primary text-white'
                            : 'border-brand-border hover:border-primary/50'
                        } ${v && v.stock === 0 ? 'opacity-40 line-through' : ''}`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stock warning */}
            {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 5 && (
              <p className="font-body text-sm text-orange-600 mb-4">
                Only {selectedVariant.stock} left in stock!
              </p>
            )}

            {/* Qty + CTA */}
            <div className="flex gap-3 mb-4">
              <div className="flex items-center border border-brand-border">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-11 h-11 flex items-center justify-center hover:bg-brand-surface transition-colors" aria-label="Decrease"><Minus size={15} /></button>
                <span className="w-12 text-center font-body text-sm font-medium">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(selectedVariant?.stock || 10, q + 1))} className="w-11 h-11 flex items-center justify-center hover:bg-brand-surface transition-colors" aria-label="Increase"><Plus size={15} /></button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={!hasStock || cartLoading}
                className="flex-1 btn-primary justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <ShoppingBag size={18} />
                {hasStock ? 'Add to Bag' : 'Out of Stock'}
              </button>
              <button
                onClick={() => { if (!isAuthenticated) { navigate('/auth/login'); return; } toggle(product._id); }}
                className={`w-11 h-11 border-2 flex items-center justify-center transition-all ${
                  wishlisted ? 'border-primary bg-primary/5 text-primary' : 'border-brand-border hover:border-primary hover:text-primary'
                }`}
                aria-label="Wishlist"
              >
                <Heart size={18} fill={wishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Info chips */}
            <div className="grid grid-cols-3 gap-3 mt-6 py-5 border-y border-brand-border">
              {[
                { icon: Truck, label: 'Free Delivery', sub: 'On orders ₹999+' },
                { icon: RotateCcw, label: 'Easy Returns', sub: '7-day returns' },
                { icon: Shield, label: 'Secure Payment', sub: '100% safe' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex flex-col items-center text-center gap-1">
                  <Icon size={20} className="text-primary" />
                  <span className="font-body text-xs font-medium text-brand-text">{label}</span>
                  <span className="font-body text-xs text-brand-muted">{sub}</span>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="mt-8">
              <div className="flex border-b border-brand-border">
                {(['description', 'reviews', 'shipping'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-5 py-3 font-body text-sm capitalize border-b-2 -mb-px transition-colors ${
                      tab === t ? 'border-primary text-primary' : 'border-transparent text-brand-muted hover:text-brand-text'
                    }`}
                  >
                    {t} {t === 'reviews' && reviews.length > 0 ? `(${reviews.length})` : ''}
                  </button>
                ))}
              </div>
              <div className="pt-5">
                {tab === 'description' && (
                  <div className="font-body text-sm text-brand-muted leading-relaxed space-y-3">
                    <p>{product.description}</p>
                    {product.variants[0]?.fabric && <p><strong>Fabric:</strong> {product.variants[0].fabric}</p>}
                    {product.variants[0]?.pattern && <p><strong>Pattern:</strong> {product.variants[0].pattern}</p>}
                  </div>
                )}
                {tab === 'reviews' && (
                  <div className="space-y-5">
                    {reviews.length === 0 ? (
                      <p className="font-body text-sm text-brand-muted">No reviews yet. Be the first to review!</p>
                    ) : reviews.map((r) => (
                      <div key={r._id} className="pb-5 border-b border-brand-border last:border-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-body text-xs font-bold text-primary">
                            {r.user.name[0]}
                          </div>
                          <div>
                            <p className="font-body text-sm font-medium">{r.user.name}</p>
                            <p className="font-body text-xs text-brand-muted">{formatDate(r.createdAt)}</p>
                          </div>
                          {r.isVerifiedPurchase && (
                            <span className="ml-auto font-body text-xs text-green-600 bg-green-50 px-2 py-0.5">{'✓'} Verified</span>
                          )}
                        </div>
                        <div className="flex gap-0.5 mb-2">
                          {[1,2,3,4,5].map((s) => <Star key={s} size={12} className={s <= r.rating ? 'text-primary fill-primary' : 'text-brand-border'} />)}
                        </div>
                        {r.title && <p className="font-body text-sm font-medium mb-1">{r.title}</p>}
                        <p className="font-body text-sm text-brand-muted">{r.body}</p>
                      </div>
                    ))}
                  </div>
                )}
                {tab === 'shipping' && (
                  <div className="font-body text-sm text-brand-muted leading-relaxed space-y-3">
                    <p>• Free shipping on orders above ₹999</p>
                    <p>• Standard delivery: 4–7 business days</p>
                    <p>• Express delivery: 1–3 business days (₹149)</p>
                    <p>• Cash on Delivery available across India</p>
                    <p>• Easy returns within 7 days of delivery</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zoom modal */}
      <AnimatePresence>
        {zoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-text/90 z-[90] flex items-center justify-center p-4"
            onClick={() => setZoom(false)}
          >
            <img src={images[imgIdx]} alt="" className="max-h-[90vh] max-w-[90vw] object-contain" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Related */}
      {related.length > 0 && (
        <ProductRow
          label="You May Also Like"
          title="Related Products"
          products={related}
          viewAllHref={`/products?category=${product.category?.slug}`}
        />
      )}
    </div>
  );
}
