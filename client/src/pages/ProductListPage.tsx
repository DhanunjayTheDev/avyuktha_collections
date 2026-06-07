import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Search, Check } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import Footer from '../components/layout/Footer';
import { productApi } from '../api/product.api';
import type { Product, Category, Collection } from '../types';

const SORT_OPTIONS = [
  { label: 'Newest First', value: '-createdAt' },
  { label: 'Price: Low to High', value: 'salePrice' },
  { label: 'Price: High to Low', value: '-salePrice' },
  { label: 'Most Popular', value: '-ratings.count' },
  { label: 'Highest Rated', value: '-ratings.average' },
  { label: 'Biggest Discount', value: '-discountPercentage' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

const COLORS: { name: string; hex: string }[] = [
  { name: 'Red', hex: '#EF4444' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Green', hex: '#22C55E' },
  { name: 'Yellow', hex: '#EAB308' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Purple', hex: '#A855F7' },
  { name: 'Black', hex: '#111827' },
  { name: 'White', hex: '#F9FAFB' },
  { name: 'Beige', hex: '#D4A57C' },
  { name: 'Gold', hex: '#C8A97E' },
];

const FABRICS = ['Silk', 'Cotton', 'Georgette', 'Chiffon', 'Linen', 'Velvet', 'Net', 'Crepe', 'Satin'];

const PRICE_RANGES = [
  { label: 'Under ₹999', min: 0, max: 999 },
  { label: '₹999 – ₹2,999', min: 999, max: 2999 },
  { label: '₹2,999 – ₹5,999', min: 2999, max: 5999 },
  { label: '₹5,999 – ₹10,000', min: 5999, max: 10000 },
  { label: '₹10,000 – ₹20,000', min: 10000, max: 20000 },
  { label: 'Above ₹20,000', min: 20000, max: 999999 },
];

/* ─────────── Collapsible section ─────────── */
function Section({
  title, count, children, defaultOpen = true,
}: { title: string; count?: number; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-brand-border last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full py-3.5 text-left group"
      >
        <span className="flex items-center gap-1.5 font-body text-[10px] font-bold uppercase tracking-[0.18em] text-brand-muted group-hover:text-brand-text transition-colors">
          {title}
          {!!count && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary text-white text-[8px] font-bold">
              {count}
            </span>
          )}
        </span>
        {open ? <ChevronUp size={13} className="text-brand-muted" /> : <ChevronDown size={13} className="text-brand-muted" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckRow({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 py-1.5 font-body text-[13px] transition-colors text-left
        ${active ? 'text-brand-text font-medium' : 'text-brand-muted hover:text-brand-text'}`}
    >
      <span className={`w-[16px] h-[16px] border flex-shrink-0 flex items-center justify-center transition-colors
        ${active ? 'bg-brand-text border-brand-text' : 'border-brand-border'}`}>
        {active && <Check size={10} className="text-white" strokeWidth={3} />}
      </span>
      {label}
    </button>
  );
}

function RadioRow({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 py-1.5 font-body text-[13px] transition-colors text-left
        ${active ? 'text-brand-text font-medium' : 'text-brand-muted hover:text-brand-text'}`}
    >
      <span className={`w-[16px] h-[16px] rounded-full border flex-shrink-0 flex items-center justify-center transition-colors
        ${active ? 'border-brand-text' : 'border-brand-border'}`}>
        {active && <span className="w-2 h-2 rounded-full bg-brand-text block" />}
      </span>
      {label}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════ */
export default function ProductListPage() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);
  const productsPaneRef = useRef<HTMLDivElement>(null);

  const page       = Number(params.get('page') || 1);
  const sort       = params.get('sort') || '-createdAt';
  const search     = params.get('search') || '';
  const category   = params.get('category') || '';
  const collection = params.get('collection') || '';
  const minPrice   = params.get('minPrice') || '';
  const maxPrice   = params.get('maxPrice') || '';
  const sizes      = params.getAll('size');
  const colors     = params.getAll('color');
  const fabrics    = params.getAll('fabric');
  const isNewArrival = params.get('isNewArrival') === 'true';
  const isBestSeller = params.get('isBestSeller') === 'true';
  const isTrending   = params.get('isTrending') === 'true';

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await productApi.getProducts({
        page, sort,
        search: search || undefined,
        category: category || undefined,
        collection: collection || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        isNewArrival: isNewArrival || undefined,
        isBestSeller: isBestSeller || undefined,
        isTrending: isTrending || undefined,
        limit: 24,
      });
      setProducts(data.data || []);
      setTotal(data.pagination?.total || 0);
      setPages(data.pagination?.pages || 1);
    } catch {
      /* no-op */
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, sort, search, category, collection, minPrice, maxPrice, isNewArrival, isBestSeller, isTrending]);

  useEffect(() => {
    productApi.getCategories().then(({ data }) => setCategories(data.data || [])).catch(() => {});
    productApi.getCollections().then(({ data }) => setCollections(data.data || [])).catch(() => {});
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Scroll the PRODUCTS PANE (not window) to top on page/filter change
  useEffect(() => {
    productsPaneRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, category, collection, sort, search]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  /* ─── URL helpers ─── */
  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setParams(next);
  };

  const toggleMulti = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    const curr = next.getAll(key);
    next.delete(key); next.delete('page');
    (curr.includes(value) ? curr.filter((v) => v !== value) : [...curr, value])
      .forEach((v) => next.append(key, v));
    setParams(next);
  };

  const setPriceRange = (min: number, max: number) => {
    const next = new URLSearchParams(params);
    if (minPrice === String(min) && maxPrice === String(max)) {
      next.delete('minPrice'); next.delete('maxPrice');
    } else {
      next.set('minPrice', String(min)); next.set('maxPrice', String(max));
    }
    next.delete('page'); setParams(next);
  };

  const clearAll = () => setParams({});

  /* ─── Derived ─── */
  const activeCount = [
    category, collection, minPrice, isNewArrival, isBestSeller, isTrending,
    ...sizes, ...colors, ...fabrics,
  ].filter(Boolean).length;

  const categoryName   = categories.find((c) => c.slug === category)?.name || '';
  const collectionName = collections.find((c) => c.slug === collection)?.name || '';

  const pageTitle = search ? `"${search}"`
    : categoryName || collectionName
    || (isNewArrival ? 'New Arrivals' : '')
    || (isBestSeller ? 'Best Sellers' : '')
    || (isTrending ? 'Trending' : '')
    || 'All Products';

  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label || 'Newest First';

  const chips = [
    category     && { label: categoryName || category,     clear: () => setParam('category', '') },
    collection   && { label: collectionName || collection, clear: () => setParam('collection', '') },
    isNewArrival && { label: 'New Arrivals', clear: () => setParam('isNewArrival', '') },
    isBestSeller && { label: 'Best Sellers', clear: () => setParam('isBestSeller', '') },
    isTrending   && { label: 'Trending',     clear: () => setParam('isTrending', '') },
    minPrice     && { label: `₹${Number(minPrice).toLocaleString('en-IN')}+`, clear: () => { setParam('minPrice', ''); setParam('maxPrice', ''); } },
    ...sizes.map((s)   => ({ label: `Size: ${s}`, clear: () => toggleMulti('size', s) })),
    ...colors.map((c)  => ({ label: c,            clear: () => toggleMulti('color', c) })),
    ...fabrics.map((f) => ({ label: f,            clear: () => toggleMulti('fabric', f) })),
  ].filter(Boolean) as { label: string; clear: () => void }[];

  /* ─── Filter panel (shared) ─── */
  const Filters = () => (
    <>
      <Section title="Category">
        {categories.map((cat) => (
          <CheckRow key={cat._id} label={cat.name}
            active={category === cat.slug}
            onClick={() => setParam('category', category === cat.slug ? '' : cat.slug)} />
        ))}
      </Section>

      {collections.length > 0 && (
        <Section title="Collections" defaultOpen={false}>
          {collections.map((col) => (
            <CheckRow key={col._id} label={col.name}
              active={collection === col.slug}
              onClick={() => setParam('collection', collection === col.slug ? '' : col.slug)} />
          ))}
        </Section>
      )}

      <Section title="Price Range">
        {PRICE_RANGES.map((r) => (
          <RadioRow key={r.label} label={r.label}
            active={minPrice === String(r.min) && maxPrice === String(r.max)}
            onClick={() => setPriceRange(r.min, r.max)} />
        ))}
      </Section>

      <Section title="Size" count={sizes.length} defaultOpen={false}>
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map((s) => {
            const active = sizes.includes(s);
            return (
              <button key={s} onClick={() => toggleMulti('size', s)}
                className={`font-body text-[11px] font-medium h-8 px-3 border transition-all
                  ${active ? 'bg-brand-text text-white border-brand-text' : 'border-brand-border text-brand-muted hover:border-brand-text hover:text-brand-text'}`}>
                {s}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Colour" count={colors.length} defaultOpen={false}>
        <div className="grid grid-cols-5 gap-x-1 gap-y-3">
          {COLORS.map(({ name, hex }) => {
            const active = colors.includes(name);
            return (
              <button key={name} onClick={() => toggleMulti('color', name)}
                className="flex flex-col items-center gap-1 group">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center transition-all
                    ${active ? 'ring-2 ring-primary ring-offset-1 scale-110' : 'ring-1 ring-brand-border group-hover:ring-brand-muted'}`}
                  style={{ background: hex }}>
                  {active && (
                    <Check size={11} strokeWidth={3}
                      className={['White', 'Yellow', 'Beige', 'Gold'].includes(name) ? 'text-brand-text' : 'text-white'} />
                  )}
                </span>
                <span className={`font-body text-[9px] leading-none ${active ? 'text-primary font-semibold' : 'text-brand-muted'}`}>
                  {name}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Fabric" count={fabrics.length} defaultOpen={false}>
        <div className="flex flex-wrap gap-1.5">
          {FABRICS.map((f) => {
            const active = fabrics.includes(f);
            return (
              <button key={f} onClick={() => toggleMulti('fabric', f)}
                className={`font-body text-[11px] font-medium px-3 py-1.5 border rounded-full transition-all
                  ${active ? 'bg-primary text-white border-primary' : 'border-brand-border text-brand-muted hover:border-primary hover:text-primary'}`}>
                {f}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Discover" defaultOpen={false}>
        {[
          { label: 'New Arrivals', key: 'isNewArrival', active: isNewArrival },
          { label: 'Best Sellers', key: 'isBestSeller', active: isBestSeller },
          { label: 'Trending Now', key: 'isTrending',   active: isTrending },
        ].map(({ label, key, active }) => (
          <CheckRow key={key} label={label} active={active}
            onClick={() => setParam(key, active ? '' : 'true')} />
        ))}
      </Section>
    </>
  );

  /* ═══════════════════════════════════════════════════════════
     App-shell: root is EXACTLY viewport-minus-topbar tall with
     overflow-hidden, so the window itself never scrolls (Lenis has
     nothing to hijack). The sidebar and products columns each own
     their scroll via data-lenis-prevent + native overflow.
  ═══════════════════════════════════════════════════════════ */
  return (
    <div
      className="flex flex-col overflow-hidden bg-brand-bg"
      style={{ marginTop: 'var(--topbar-height)', height: 'calc(100vh - var(--topbar-height))' }}
    >
      {/* ── Header band (fixed, never scrolls) ── */}
      <div className="flex-shrink-0 border-b border-brand-border bg-white">
        <div className="container-custom py-4 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="font-body text-[10px] tracking-[0.25em] uppercase text-primary font-semibold mb-0.5">
              {collectionName ? 'Collection' : 'Shop'}
            </p>
            <h1 className="font-heading text-xl md:text-2xl font-semibold text-brand-text leading-tight">
              {pageTitle}
            </h1>
          </div>
          <p className="font-body text-xs text-brand-muted pb-1">
            {loading ? 'Loading…' : `${total.toLocaleString('en-IN')} ${total === 1 ? 'style' : 'styles'}`}
          </p>
        </div>
      </div>

      {/* ── Two-pane body (flex-1, panes scroll internally) ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ════ SIDEBAR — own scroll ════ */}
        <aside
          className="hidden lg:flex flex-col w-60 xl:w-64 flex-shrink-0 border-r border-brand-border bg-white overflow-y-auto"
          data-lenis-prevent
          style={{ overscrollBehavior: 'contain' }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border sticky top-0 bg-white z-10">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-brand-muted" />
              <span className="font-body text-[10px] font-bold uppercase tracking-[0.2em] text-brand-text">Filters</span>
              {activeCount > 0 && (
                <span className="w-4 h-4 bg-primary text-white rounded-full text-[8px] font-bold flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </div>
            {activeCount > 0 && (
              <button onClick={clearAll} className="font-body text-[11px] text-primary hover:text-primary-dark transition-colors">
                Clear all
              </button>
            )}
          </div>
          <div className="px-5 pb-8">
            <Filters />
          </div>
        </aside>

        {/* ════ PRODUCTS — own scroll, contains footer ════ */}
        <div
          ref={productsPaneRef}
          className="flex-1 min-w-0 overflow-y-auto"
          data-lenis-prevent
          style={{ overscrollBehavior: 'contain' }}
        >
          {/* Sticky toolbar */}
          <div className="sticky top-0 z-20 bg-brand-bg/95 backdrop-blur-sm border-b border-brand-border">
            <div className="flex items-center gap-3 px-4 md:px-6 py-3">
              {/* Mobile filter trigger */}
              <button onClick={() => setMobileOpen(true)}
                className="lg:hidden flex items-center gap-1.5 border border-brand-border px-3.5 py-2 font-body text-[11px] text-brand-muted hover:border-brand-text hover:text-brand-text transition-colors">
                <SlidersHorizontal size={12} /> Filters
                {activeCount > 0 && (
                  <span className="w-4 h-4 bg-primary text-white rounded-full text-[8px] font-bold flex items-center justify-center">
                    {activeCount}
                  </span>
                )}
              </button>

              {/* Active chips */}
              {chips.length > 0 && (
                <div className="hidden lg:flex flex-1 items-center gap-1.5 overflow-x-auto scrollbar-hide">
                  {chips.slice(0, 6).map((chip, i) => (
                    <button key={i} onClick={chip.clear}
                      className="inline-flex items-center gap-1 flex-shrink-0 font-body text-[10px] font-medium px-2.5 py-1.5 bg-brand-surface border border-brand-border text-brand-text hover:border-primary hover:text-primary transition-colors">
                      {chip.label} <X size={8} strokeWidth={2.5} />
                    </button>
                  ))}
                  {chips.length > 6 && (
                    <span className="font-body text-[10px] text-brand-muted flex-shrink-0">+{chips.length - 6}</span>
                  )}
                </div>
              )}

              {/* Sort */}
              <div className="relative ml-auto flex-shrink-0" ref={sortRef}>
                <button onClick={() => setSortOpen((o) => !o)}
                  className="flex items-center gap-2 border border-brand-border px-3.5 py-2 font-body text-[11px] text-brand-muted hover:border-brand-text transition-colors min-w-[170px] justify-between bg-white">
                  <span>Sort: <span className="text-brand-text font-medium">{sortLabel}</span></span>
                  <ChevronDown size={11} className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {sortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 top-full mt-1 bg-white border border-brand-border shadow-luxury z-40 min-w-[210px]"
                    >
                      {SORT_OPTIONS.map((o) => (
                        <button key={o.value} onClick={() => { setParam('sort', o.value); setSortOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 font-body text-[12px] flex items-center justify-between transition-colors
                            ${sort === o.value ? 'text-primary bg-brand-surface font-semibold' : 'text-brand-text hover:bg-brand-surface'}`}>
                          {o.label}
                          {sort === o.value && <Check size={12} className="text-primary" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile chips row */}
            {chips.length > 0 && (
              <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto scrollbar-hide px-4 pb-3">
                {chips.map((chip, i) => (
                  <button key={i} onClick={chip.clear}
                    className="inline-flex items-center gap-1 flex-shrink-0 font-body text-[10px] font-medium px-2.5 py-1.5 bg-brand-surface border border-brand-border text-brand-text">
                    {chip.label} <X size={8} strokeWidth={2.5} />
                  </button>
                ))}
                <button onClick={clearAll} className="font-body text-[10px] text-red-500 flex-shrink-0">Clear</button>
              </div>
            )}
          </div>

          {/* Grid */}
          <div className="px-4 md:px-6 py-6">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i}>
                    <div className="aspect-product skeleton" />
                    <div className="h-2.5 skeleton mt-3 w-2/3" />
                    <div className="h-2.5 skeleton mt-1.5 w-1/3" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-28 text-center">
                <div className="w-14 h-14 border border-brand-border flex items-center justify-center mb-5">
                  <Search size={22} className="text-brand-border" />
                </div>
                <p className="font-heading text-lg font-semibold text-brand-text mb-1.5">No styles found</p>
                <p className="font-body text-sm text-brand-muted mb-6 max-w-xs">
                  Nothing matches your current filters. Try adjusting them.
                </p>
                <button onClick={clearAll} className="btn-outline text-xs px-6 py-2.5">Clear All Filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {products.map((p, i) => (
                    <motion.div key={p._id}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: Math.min(i, 7) * 0.04 }}>
                      <ProductCard product={p} />
                    </motion.div>
                  ))}
                </div>

                {pages > 1 && (
                  <div className="flex items-center justify-center gap-1 mt-12">
                    <button onClick={() => setParam('page', String(page - 1))} disabled={page <= 1}
                      className="w-9 h-9 border border-brand-border text-brand-muted hover:border-brand-text hover:text-brand-text disabled:opacity-30 transition-colors text-sm flex items-center justify-center">‹</button>
                    {Array.from({ length: pages }, (_, i) => i + 1)
                      .filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === pages)
                      .map((p, i, arr) => (
                        <span key={`pg-${p}`} className="flex items-center gap-1">
                          {i > 0 && arr[i - 1] !== p - 1 && (
                            <span className="w-9 h-9 flex items-center justify-center text-brand-muted text-sm">…</span>
                          )}
                          <button onClick={() => setParam('page', String(p))}
                            className={`w-9 h-9 font-body text-[12px] border transition-all
                              ${p === page ? 'bg-brand-text text-white border-brand-text' : 'border-brand-border text-brand-text hover:border-brand-text'}`}>
                            {p}
                          </button>
                        </span>
                      ))}
                    <button onClick={() => setParam('page', String(page + 1))} disabled={page >= pages}
                      className="w-9 h-9 border border-brand-border text-brand-muted hover:border-brand-text hover:text-brand-text disabled:opacity-30 transition-colors text-sm flex items-center justify-center">›</button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer lives inside the scrollable products pane */}
          <Footer />
        </div>
      </div>

      {/* ════ Mobile Drawer ════ */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-brand-text/50 z-[60] lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.26, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="fixed inset-y-0 left-0 w-80 max-w-[88vw] bg-white z-[70] flex flex-col shadow-luxury-lg lg:hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border flex-shrink-0">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={14} className="text-brand-muted" />
                  <span className="font-body text-[11px] font-bold uppercase tracking-[0.18em] text-brand-text">Filters</span>
                  {activeCount > 0 && (
                    <span className="w-4 h-4 bg-primary text-white rounded-full text-[9px] font-bold flex items-center justify-center">
                      {activeCount}
                    </span>
                  )}
                </div>
                <button onClick={() => setMobileOpen(false)} className="text-brand-muted hover:text-brand-text transition-colors">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-5" data-lenis-prevent style={{ overscrollBehavior: 'contain' }}>
                <Filters />
              </div>
              <div className="flex-shrink-0 p-4 border-t border-brand-border grid grid-cols-2 gap-3">
                <button onClick={() => { clearAll(); setMobileOpen(false); }} className="btn-outline text-xs py-3 justify-center">
                  Clear All
                </button>
                <button onClick={() => setMobileOpen(false)} className="btn-primary text-xs py-3 justify-center">
                  View {total} Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
