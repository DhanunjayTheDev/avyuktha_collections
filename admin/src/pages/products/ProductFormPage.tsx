import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, Upload } from 'lucide-react';
import { productApi } from '../../api';
import { useCategories, useCollections, useProductTypes, useAttributes } from '../../hooks/useCatalog';
import Select from '../../components/common/Select';
import type { ProductVariant, Attribute } from '../../types';
import toast from 'react-hot-toast';
import { PageSpinner } from '../../components/common/Spinner';
import { colorNameFromHex, isHex } from '../../utils/colorName';

const skuCode = (s: string, n = 3) =>
  (s || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, n) || 'GEN';

interface FormState {
  name: string;
  shortDescription: string;
  description: string;
  productType: string;
  category: string;
  collections: string[];
  mrp: string;
  salePrice: string;
  images: string[];
  tags: string;
  attributes: Record<string, string[]>; // product-level
  weightGrams: string;
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
  name: '', shortDescription: '', description: '', productType: 'clothing', category: '', collections: [],
  mrp: '', salePrice: '', images: [], tags: '',
  attributes: {}, weightGrams: '',
  isFeatured: false, isNewArrival: true, isBestSeller: false, isTrending: false, isActive: true,
  variants: [{ sku: '', stock: 0, attributes: {} }],
  metaTitle: '', metaDescription: '',
};

const appliesTo = (a: Attribute, typeSlug: string) =>
  a.isActive && (a.productTypes.length === 0 || a.productTypes.includes(typeSlug));

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = id && id !== 'new';

  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(isEdit ? true : false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Cached catalog config (shared across pages — no refetch on revisit)
  const categories = useCategories().data || [];
  const collections = useCollections().data || [];
  const productTypes = (useProductTypes().data || []).filter((t) => t.isActive);
  const attributes = (useAttributes().data || []).filter((a) => a.isActive);

  useEffect(() => {
    if (!isEdit) return;
    productApi.getById(id!).then(({ data }) => {
      const p = data.data;
      setForm({
        name: p.name, shortDescription: p.shortDescription, description: p.description,
        productType: p.productType || 'clothing',
        category: p.category?._id || '', collections: p.collections?.map((c: { _id: string }) => c._id) || [],
        mrp: String(p.mrp), salePrice: String(p.salePrice),
        images: p.images || [], tags: p.tags?.join(', ') || '',
        attributes: p.attributes || {},
        weightGrams: p.weightGrams != null ? String(p.weightGrams) : '',
        isFeatured: p.isFeatured, isNewArrival: p.isNewArrival, isBestSeller: p.isBestSeller,
        isTrending: p.isTrending, isActive: p.isActive,
        variants: p.variants?.length
          ? p.variants.map((v: ProductVariant) => ({ sku: v.sku, stock: v.stock, images: v.images, attributes: v.attributes || {} }))
          : emptyForm.variants,
        metaTitle: p.metaTitle || '', metaDescription: p.metaDescription || '',
      });
    }).catch(() => navigate('/products')).finally(() => setLoading(false));
  }, [id, isEdit]);

  // Attributes that apply to the chosen product type
  const productAttrs = useMemo(
    () => attributes.filter((a) => a.level === 'product' && appliesTo(a, form.productType)).sort((a, b) => a.sortOrder - b.sortOrder),
    [attributes, form.productType]
  );
  const variantAttrs = useMemo(
    () => attributes.filter((a) => a.level === 'variant' && appliesTo(a, form.productType)).sort((a, b) => a.sortOrder - b.sortOrder),
    [attributes, form.productType]
  );

  const removeImage = async (i: number, url: string) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));
    productApi.deleteImage(url).catch(() => {}); // purge from bucket, best-effort
  };

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

  // ── Product-level attribute setters ──
  const toggleProductAttr = (slug: string, value: string) =>
    setForm((prev) => {
      const cur = prev.attributes[slug] || [];
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
      return { ...prev, attributes: { ...prev.attributes, [slug]: next } };
    });
  const setProductAttrSingle = (slug: string, value: string) =>
    setForm((prev) => ({ ...prev, attributes: { ...prev.attributes, [slug]: value ? [value] : [] } }));

  // ── SKU preview (editable; server re-validates uniqueness) ──
  const catName = categories.find((c) => c._id === form.category)?.name || '';
  const genSku = (idx: number) =>
    `AVY-${skuCode(form.productType)}-${skuCode(catName)}-${Date.now().toString().slice(-5)}-${String(idx + 1).padStart(2, '0')}`;

  // Auto-fill blank variant SKUs once type + category are chosen, so the
  // generated SKU is visible in the field (admin can still edit it).
  useEffect(() => {
    if (!form.productType || !form.category) return;
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) => (v.sku?.trim() ? v : { ...v, sku: genSku(i) })),
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.productType, form.category]);

  // ── Variants ──
  const addVariant = () =>
    setForm((prev) => ({ ...prev, variants: [...prev.variants, { sku: genSku(prev.variants.length), stock: 0, attributes: {} }] }));
  const updateVariant = (i: number, key: 'sku' | 'stock', val: string | number) =>
    setForm((prev) => { const vs = [...prev.variants]; vs[i] = { ...vs[i], [key]: val }; return { ...prev, variants: vs }; });
  const updateVariantAttr = (i: number, slug: string, val: string) =>
    setForm((prev) => {
      const vs = [...prev.variants];
      vs[i] = { ...vs[i], attributes: { ...(vs[i].attributes || {}), [slug]: val } };
      return { ...prev, variants: vs };
    });
  const removeVariant = (i: number) =>
    setForm((prev) => ({ ...prev, variants: prev.variants.filter((_, idx) => idx !== i) }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productType) { toast.error('Select a product type'); return; }
    if (!form.category) { toast.error('Select a category'); return; }
    if (form.images.length === 0) { toast.error('Add at least one image'); return; }
    // SKU is optional — blank ones are auto-generated server-side.

    setSaving(true);
    const payload = {
      ...form,
      mrp: Number(form.mrp),
      salePrice: Number(form.salePrice),
      weightGrams: form.weightGrams ? Number(form.weightGrams) : undefined,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };
    try {
      if (isEdit) { await productApi.update(id!, payload); toast.success('Product updated'); }
      else { await productApi.create(payload); toast.success('Product created'); }
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

          {/* Dynamic product-level attributes */}
          {(productAttrs.length > 0 || form.productType !== 'clothing') && (
            <div className="card space-y-4">
              <h2 className="font-heading text-base font-semibold border-b border-brand-border pb-3">Specifications</h2>
              {productAttrs.map((attr) => {
                const selected = form.attributes[attr.slug] || [];
                if (attr.inputType === 'select') {
                  return (
                    <div key={attr._id}>
                      <label className="input-label">{attr.name}</label>
                      <Select value={selected[0] || ''} onChange={(v) => setProductAttrSingle(attr.slug, v)}
                        placeholder={`— Select ${attr.name} —`}
                        options={attr.options.map((o) => ({ value: o.value, label: o.label }))} />
                    </div>
                  );
                }
                if (attr.inputType === 'color') {
                  return (
                    <div key={attr._id}>
                      <label className="input-label">{attr.name}</label>
                      <div className="flex flex-wrap gap-2">
                        {attr.options.map((o) => {
                          const active = selected.includes(o.value);
                          return (
                            <button key={o.value} type="button" onClick={() => toggleProductAttr(attr.slug, o.value)}
                              title={o.label}
                              className={`w-7 h-7 rounded-full border-2 transition-all ${active ? 'border-primary scale-110' : 'border-brand-border'}`}
                              style={{ background: o.hex || '#ccc' }} />
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                // chips / multiselect
                return (
                  <div key={attr._id}>
                    <label className="input-label">{attr.name}</label>
                    <div className="flex flex-wrap gap-2">
                      {attr.options.map((o) => {
                        const active = selected.includes(o.value);
                        return (
                          <button key={o.value} type="button" onClick={() => toggleProductAttr(attr.slug, o.value)}
                            className={`text-[11px] px-3 py-1.5 border rounded-full transition-colors ${active ? 'bg-primary text-white border-primary' : 'border-brand-border text-brand-muted hover:border-primary'}`}>
                            {o.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {form.productType !== 'clothing' && (
                <div>
                  <label className="input-label">Weight (grams)</label>
                  <input type="number" step="0.01" min="0" value={form.weightGrams}
                    onChange={(e) => setForm({ ...form, weightGrams: e.target.value })}
                    className="input-field" placeholder="e.g. 12.5" />
                </div>
              )}
            </div>
          )}

          {/* Images */}
          <div className="card space-y-4">
            <h2 className="font-heading text-base font-semibold border-b border-brand-border pb-3">Product Images</h2>
            {form.images.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {form.images.map((img, i) => (
                  <div key={i} className="relative aspect-[3/4] bg-brand-bg">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button type="button"
                      onClick={() => removeImage(i, img)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white flex items-center justify-center text-xs">×</button>
                    {i === 0 && <span className="absolute bottom-1 left-1 bg-primary text-white text-[9px] px-1">Main</span>}
                  </div>
                ))}
              </div>
            )}
            <label className={`flex flex-col items-center justify-center border-2 border-dashed border-brand-border py-8 cursor-pointer hover:border-primary transition-colors ${uploading ? 'opacity-60' : ''}`}>
              <Upload size={24} className="text-brand-muted mb-2" />
              <span className="font-body text-sm text-brand-muted">{uploading ? 'Uploading...' : 'Click to upload images'}</span>
              <span className="font-body text-xs text-brand-muted mt-1">JPG, PNG, WebP — max 2MB each, auto-converted to WebP</span>
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
                  <label className="input-label">SKU <span className="text-brand-muted font-normal">(auto)</span></label>
                  <input value={v.sku} onChange={(e) => updateVariant(i, 'sku', e.target.value)} className="input-field" placeholder="Auto-generated if blank" />
                </div>
                <div>
                  <label className="input-label">Stock</label>
                  <input type="number" value={v.stock} onChange={(e) => updateVariant(i, 'stock', Number(e.target.value))} className="input-field" min="0" />
                </div>
                {/* Dynamic variant-level attributes */}
                {variantAttrs.map((attr) => {
                  const val = v.attributes?.[attr.slug] || '';
                  if (attr.inputType === 'color') {
                    return (
                      <div key={attr._id} className="col-span-full">
                        <label className="input-label">
                          {attr.name}
                          {isHex(val) && <span className="ml-2 font-normal text-brand-muted">→ {colorNameFromHex(val)}</span>}
                        </label>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {/* preset swatches */}
                          {attr.options.map((o) => (
                            <button key={o.value} type="button" onClick={() => updateVariantAttr(i, attr.slug, o.value)}
                              title={o.label}
                              className={`w-7 h-7 rounded-full border-2 ${val === o.value ? 'border-primary scale-110' : 'border-brand-border'}`}
                              style={{ background: o.hex || '#ccc' }} />
                          ))}
                          <span className="w-px h-6 bg-brand-border mx-1" />
                          {/* colour wheel — pick any colour */}
                          <input type="color" value={isHex(val) ? val : '#000000'}
                            onChange={(e) => updateVariantAttr(i, attr.slug, e.target.value)}
                            title="Pick a custom colour"
                            className="w-9 h-9 p-0 border border-brand-border rounded cursor-pointer bg-transparent" />
                          {/* hex / colour code text input */}
                          <input type="text" value={val}
                            onChange={(e) => updateVariantAttr(i, attr.slug, e.target.value)}
                            placeholder="#RRGGBB or name"
                            className="input-field flex-1 min-w-[120px]" />
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={attr._id}>
                      <label className="input-label">{attr.name}</label>
                      <Select value={val} onChange={(value) => updateVariantAttr(i, attr.slug, value)}
                        placeholder="— Select —"
                        options={attr.options.map((o) => ({ value: o.value, label: o.label }))} />
                    </div>
                  );
                })}
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
          {/* Catalog */}
          <div className="card space-y-4">
            <h2 className="font-heading text-base font-semibold border-b border-brand-border pb-3">Catalog</h2>
            <div>
              <label className="input-label">Product Type *</label>
              <Select value={form.productType} onChange={(v) => setForm({ ...form, productType: v })}
                placeholder="— Select type —"
                options={productTypes.map((t) => ({ value: t.slug, label: t.name }))} />
            </div>
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
                    <input type="checkbox" checked={form.collections.includes(col._id)}
                      onChange={(e) => setForm((prev) => ({
                        ...prev,
                        collections: e.target.checked ? [...prev.collections, col._id] : prev.collections.filter((id) => id !== col._id),
                      }))}
                      className="accent-primary" />
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
                <input type="checkbox" checked={form[key] as boolean}
                  onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                  className="accent-primary w-4 h-4" />
                <span className="font-body text-sm">{label}</span>
              </label>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <button type="submit" disabled={saving} className="btn-primary w-full justify-center">
              {saving ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
            <button type="button" onClick={() => navigate('/products')} className="btn-outline w-full justify-center">Cancel</button>
          </div>
        </div>
      </div>
    </form>
  );
}
