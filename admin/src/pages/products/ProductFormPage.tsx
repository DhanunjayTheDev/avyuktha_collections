import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, Upload } from 'lucide-react';
import { productApi, categoryApi, collectionApi } from '../../api';
import Select from '../../components/common/Select';
import type { Category, Collection, ProductVariant } from '../../types';
import toast from 'react-hot-toast';
import { PageSpinner } from '../../components/common/Spinner';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

interface FormState {
  name: string;
  shortDescription: string;
  description: string;
  category: string;
  collections: string[];
  mrp: string;
  salePrice: string;
  images: string[];
  tags: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isTrending: boolean;
  isActive: boolean;
  variants: ProductVariant[];
  metaTitle: string;
  metaDescription: string;
}

const emptyForm: FormState = {
  name: '', shortDescription: '', description: '', category: '', collections: [],
  mrp: '', salePrice: '', images: [], tags: '',
  isFeatured: false, isNewArrival: true, isBestSeller: false, isTrending: false, isActive: true,
  variants: [{ sku: '', stock: 0, color: '', size: '', fabric: '', pattern: '' }],
  metaTitle: '', metaDescription: '',
};

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = id && id !== 'new';

  const [form, setForm] = useState<FormState>(emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(isEdit ? true : false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    Promise.all([categoryApi.getAll(), collectionApi.getAll()]).then(([c, col]) => {
      setCategories(c.data.data || []);
      setCollections(col.data.data || []);
    });
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    productApi.getById(id!).then(({ data }) => {
      const p = data.data;
      setForm({
        name: p.name, shortDescription: p.shortDescription, description: p.description,
        category: p.category?._id || '', collections: p.collections?.map((c: { _id: string }) => c._id) || [],
        mrp: String(p.mrp), salePrice: String(p.salePrice),
        images: p.images || [], tags: p.tags?.join(', ') || '',
        isFeatured: p.isFeatured, isNewArrival: p.isNewArrival, isBestSeller: p.isBestSeller,
        isTrending: p.isTrending, isActive: p.isActive,
        variants: p.variants?.length ? p.variants : emptyForm.variants,
        metaTitle: p.metaTitle || '', metaDescription: p.metaDescription || '',
      });
    }).catch(() => navigate('/products')).finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append('images', f));
      const { data } = await productApi.uploadImages(fd);
      setForm((prev) => ({ ...prev, images: [...prev.images, ...data.data.urls] }));
      toast.success(`${files.length} image(s) uploaded`);
    } catch {} finally { setUploading(false); }
  };

  const addVariant = () =>
    setForm((prev) => ({ ...prev, variants: [...prev.variants, { sku: '', stock: 0, color: '', size: '', fabric: '', pattern: '' }] }));

  const updateVariant = (i: number, key: keyof ProductVariant, val: string | number) =>
    setForm((prev) => {
      const vs = [...prev.variants];
      vs[i] = { ...vs[i], [key]: val };
      return { ...prev, variants: vs };
    });

  const removeVariant = (i: number) =>
    setForm((prev) => ({ ...prev, variants: prev.variants.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category) { toast.error('Select a category'); return; }
    if (form.images.length === 0) { toast.error('Add at least one image'); return; }
    const emptyVariant = form.variants.find((v) => !v.sku);
    if (emptyVariant) { toast.error('All variants need a SKU'); return; }

    setSaving(true);
    const payload = {
      ...form,
      mrp: Number(form.mrp),
      salePrice: Number(form.salePrice),
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };
    try {
      if (isEdit) {
        await productApi.update(id!, payload);
        toast.success('Product updated');
      } else {
        await productApi.create(payload);
        toast.success('Product created');
      }
      navigate('/products');
    } catch {} finally { setSaving(false); }
  };

  if (loading) return <PageSpinner />;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-5">
          {/* Basic info */}
          <div className="card space-y-4">
            <h2 className="font-heading text-base font-semibold border-b border-brand-border pb-3">Basic Information</h2>
            <div>
              <label className="input-label">Product Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="input-label">Short Description *</label>
              <input value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="input-label">Full Description *</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} className="input-field resize-none" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">MRP (₹) *</label>
                <input type="number" value={form.mrp} onChange={(e) => setForm({ ...form, mrp: e.target.value })} className="input-field" min="0" required />
              </div>
              <div>
                <label className="input-label">Sale Price (₹) *</label>
                <input type="number" value={form.salePrice} onChange={(e) => setForm({ ...form, salePrice: e.target.value })} className="input-field" min="0" required />
              </div>
            </div>
            <div>
              <label className="input-label">Tags (comma separated)</label>
              <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input-field" placeholder="silk, festive, bridal" />
            </div>
          </div>

          {/* Images */}
          <div className="card space-y-4">
            <h2 className="font-heading text-base font-semibold border-b border-brand-border pb-3">Product Images</h2>
            {form.images.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {form.images.map((img, i) => (
                  <div key={i} className="relative aspect-[3/4] bg-brand-bg">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                    {i === 0 && <span className="absolute bottom-1 left-1 bg-primary text-white text-[9px] px-1">Main</span>}
                  </div>
                ))}
              </div>
            )}
            <label className={`flex flex-col items-center justify-center border-2 border-dashed border-brand-border py-8 cursor-pointer hover:border-primary transition-colors ${uploading ? 'opacity-60' : ''}`}>
              <Upload size={24} className="text-brand-muted mb-2" />
              <span className="font-body text-sm text-brand-muted">{uploading ? 'Uploading...' : 'Click to upload images'}</span>
              <span className="font-body text-xs text-brand-muted mt-1">JPG, PNG, WebP — max 5MB each</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
            </label>
          </div>

          {/* Variants */}
          <div className="card space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h2 className="font-heading text-base font-semibold">Variants & Inventory</h2>
              <button type="button" onClick={addVariant} className="btn-outline text-xs py-1.5 px-3">
                <Plus size={13} /> Add Variant
              </button>
            </div>
            {form.variants.map((v, i) => (
              <div key={i} className="grid grid-cols-2 md:grid-cols-3 gap-3 p-3 bg-brand-bg border border-brand-border">
                <div>
                  <label className="input-label">SKU *</label>
                  <input value={v.sku} onChange={(e) => updateVariant(i, 'sku', e.target.value)} className="input-field" placeholder="AVY-001-S-RED" required />
                </div>
                <div>
                  <label className="input-label">Stock</label>
                  <input type="number" value={v.stock} onChange={(e) => updateVariant(i, 'stock', Number(e.target.value))} className="input-field" min="0" />
                </div>
                <div>
                  <label className="input-label">Size</label>
                  <Select value={v.size || ''} onChange={(val) => updateVariant(i, 'size', val)}
                    placeholder="— Select —"
                    options={SIZES.map((s) => ({ value: s, label: s }))} />
                </div>
                <div>
                  <label className="input-label">Color</label>
                  <input value={v.color || ''} onChange={(e) => updateVariant(i, 'color', e.target.value)} className="input-field" placeholder="Red" />
                </div>
                <div>
                  <label className="input-label">Fabric</label>
                  <input value={v.fabric || ''} onChange={(e) => updateVariant(i, 'fabric', e.target.value)} className="input-field" placeholder="Silk" />
                </div>
                <div>
                  <label className="input-label">Pattern</label>
                  <input value={v.pattern || ''} onChange={(e) => updateVariant(i, 'pattern', e.target.value)} className="input-field" placeholder="Floral" />
                </div>
                {form.variants.length > 1 && (
                  <div className="col-span-full flex justify-end">
                    <button type="button" onClick={() => removeVariant(i)} className="flex items-center gap-1 text-red-500 hover:text-red-700 font-body text-xs">
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* SEO */}
          <div className="card space-y-4">
            <h2 className="font-heading text-base font-semibold border-b border-brand-border pb-3">SEO</h2>
            <div>
              <label className="input-label">Meta Title</label>
              <input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} className="input-field" placeholder="Optional — defaults to product name" />
            </div>
            <div>
              <label className="input-label">Meta Description</label>
              <textarea value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} rows={2} className="input-field resize-none" />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Category */}
          <div className="card space-y-4">
            <h2 className="font-heading text-base font-semibold border-b border-brand-border pb-3">Catalog</h2>
            <div>
              <label className="input-label">Category *</label>
              <Select value={form.category} onChange={(v) => setForm({ ...form, category: v })}
                placeholder="— Select category —"
                options={categories.map((c) => ({ value: c._id, label: c.name }))} />
            </div>
            <div>
              <label className="input-label">Collections</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {collections.map((col) => (
                  <label key={col._id} className="flex items-center gap-2 font-body text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.collections.includes(col._id)}
                      onChange={(e) => setForm((prev) => ({
                        ...prev,
                        collections: e.target.checked
                          ? [...prev.collections, col._id]
                          : prev.collections.filter((id) => id !== col._id),
                      }))}
                      className="accent-primary"
                    />
                    {col.name}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Flags */}
          <div className="card space-y-3">
            <h2 className="font-heading text-base font-semibold border-b border-brand-border pb-3">Visibility</h2>
            {([
              { key: 'isActive', label: 'Active (visible on store)' },
              { key: 'isNewArrival', label: 'New Arrival' },
              { key: 'isFeatured', label: 'Featured' },
              { key: 'isBestSeller', label: 'Best Seller' },
              { key: 'isTrending', label: 'Trending' },
            ] as { key: keyof FormState; label: string }[]).map(({ key, label }) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form[key] as boolean}
                  onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                  className="accent-primary w-4 h-4"
                />
                <span className="font-body text-sm">{label}</span>
              </label>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button type="submit" disabled={saving} className="btn-primary w-full justify-center">
              {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
            <button type="button" onClick={() => navigate('/products')} className="btn-outline w-full justify-center">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
