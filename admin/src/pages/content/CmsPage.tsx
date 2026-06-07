import { useState } from 'react';
import { Save, Globe, Check, AlertCircle, Building2, Phone, Lock, CornerDownLeft, Truck, Briefcase, Image, Home } from 'lucide-react';
import { cmsApi } from '../../api';
import toast from 'react-hot-toast';

interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'richtext' | 'url' | 'email' | 'phone';
  placeholder?: string;
  help?: string;
  rows?: number;
}

interface PageDef { key: string; title: string; icon: React.ElementType; description: string; fields: FieldDef[]; }

const PAGES: PageDef[] = [
  { key: 'about', title: 'About Us', icon: Building2, description: 'Company story and brand info',
    fields: [
      { key: 'heading', label: 'Main Heading', type: 'text', placeholder: 'Our Story' },
      { key: 'subheading', label: 'Sub Heading', type: 'text', placeholder: 'Where Heritage Meets Modern Elegance' },
      { key: 'body', label: 'Brand Story', type: 'richtext', placeholder: 'Write your brand story here...', rows: 8 },
      { key: 'stat1_value', label: 'Stat 1 Value', type: 'text', placeholder: '5000+' },
      { key: 'stat1_label', label: 'Stat 1 Label', type: 'text', placeholder: 'Products' },
      { key: 'stat2_value', label: 'Stat 2 Value', type: 'text', placeholder: '50K+' },
      { key: 'stat2_label', label: 'Stat 2 Label', type: 'text', placeholder: 'Happy Customers' },
      { key: 'stat3_value', label: 'Stat 3 Value', type: 'text', placeholder: '4.8 Stars' },
      { key: 'stat3_label', label: 'Stat 3 Label', type: 'text', placeholder: 'Average Rating' },
    ],
  },
  { key: 'contact', title: 'Contact Page', icon: Phone, description: 'Contact information',
    fields: [
      { key: 'heading', label: 'Page Heading', type: 'text', placeholder: 'Get in Touch' },
      { key: 'email', label: 'Support Email', type: 'email', placeholder: 'support@avyukthafashions.com' },
      { key: 'phone', label: 'Phone', type: 'phone', placeholder: '+91 98765 43210' },
      { key: 'whatsapp', label: 'WhatsApp', type: 'phone', placeholder: '+91 98765 43210' },
      { key: 'address', label: 'Office Address', type: 'textarea', placeholder: '123 Fashion St, Hyderabad', rows: 3 },
      { key: 'hours', label: 'Business Hours', type: 'text', placeholder: 'Mon-Sat: 10AM-7PM IST' },
      { key: 'map_embed', label: 'Google Maps Embed URL', type: 'url', placeholder: 'https://maps.google.com/...', help: 'Google Maps > Share > Embed a map > copy src URL' },
    ],
  },
  { key: 'privacy', title: 'Privacy Policy', icon: Lock, description: 'Privacy policy content',
    fields: [
      { key: 'heading', label: 'Heading', type: 'text', placeholder: 'Privacy Policy' },
      { key: 'last_updated', label: 'Last Updated', type: 'text', placeholder: 'June 2025' },
      { key: 'content', label: 'Policy Content', type: 'richtext', placeholder: 'Write your privacy policy...', rows: 18, help: 'Supports HTML: <h2>, <h3>, <p>, <ul>, <li>, <strong>' },
    ],
  },
  { key: 'terms', title: 'Terms of Service', icon: Briefcase, description: 'Terms and conditions',
    fields: [
      { key: 'heading', label: 'Heading', type: 'text', placeholder: 'Terms of Service' },
      { key: 'last_updated', label: 'Last Updated', type: 'text', placeholder: 'June 2025' },
      { key: 'content', label: 'Terms Content', type: 'richtext', placeholder: 'Write your terms...', rows: 18 },
    ],
  },
  { key: 'returns', title: 'Return Policy', icon: CornerDownLeft, description: 'Return and refund policy',
    fields: [
      { key: 'heading', label: 'Heading', type: 'text', placeholder: 'Return & Refund Policy' },
      { key: 'return_window', label: 'Return Window', type: 'text', placeholder: '7 days from delivery' },
      { key: 'refund_timeline', label: 'Refund Timeline', type: 'text', placeholder: '5-7 business days' },
      { key: 'content', label: 'Policy Content', type: 'richtext', placeholder: 'Full return policy...', rows: 12 },
    ],
  },
  { key: 'shipping', title: 'Shipping Policy', icon: Truck, description: 'Shipping and delivery info',
    fields: [
      { key: 'heading', label: 'Heading', type: 'text', placeholder: 'Shipping Policy' },
      { key: 'free_threshold', label: 'Free Shipping Threshold', type: 'text', placeholder: 'Rs. 999' },
      { key: 'standard_days', label: 'Standard Delivery', type: 'text', placeholder: '4-7 business days' },
      { key: 'express_days', label: 'Express Delivery', type: 'text', placeholder: '1-3 business days' },
      { key: 'express_charge', label: 'Express Charge', type: 'text', placeholder: 'Rs. 149' },
      { key: 'content', label: 'Full Policy', type: 'richtext', placeholder: 'Detailed shipping info...', rows: 10 },
    ],
  },
  { key: 'careers', title: 'Careers', icon: Briefcase, description: 'Careers page content',
    fields: [
      { key: 'heading', label: 'Heading', type: 'text', placeholder: 'Join Our Team' },
      { key: 'subheading', label: 'Subheading', type: 'text', placeholder: 'Build the future of Indian fashion' },
      { key: 'body', label: 'About Working Here', type: 'richtext', placeholder: 'Company culture...', rows: 5 },
      { key: 'email', label: 'Apply Email', type: 'email', placeholder: 'careers@avyukthafashions.com' },
      { key: 'openings', label: 'Current Openings', type: 'richtext', placeholder: 'List open positions...', rows: 8 },
    ],
  },
  { key: 'homepage_hero', title: 'Homepage Hero', icon: Image, description: 'Hero slideshow content',
    fields: [
      { key: 'slide1_label', label: 'Slide 1 - Label', type: 'text', placeholder: 'New Collection 2025' },
      { key: 'slide1_title', label: 'Slide 1 - Title', type: 'text', placeholder: 'Elegance Redefined' },
      { key: 'slide1_subtitle', label: 'Slide 1 - Subtitle', type: 'textarea', placeholder: 'Discover premium ethnic...', rows: 2 },
      { key: 'slide1_cta', label: 'Slide 1 - Button Text', type: 'text', placeholder: 'Shop Now' },
      { key: 'slide2_label', label: 'Slide 2 - Label', type: 'text', placeholder: 'Wedding Collection' },
      { key: 'slide2_title', label: 'Slide 2 - Title', type: 'text', placeholder: 'Bridal Splendour' },
      { key: 'slide2_subtitle', label: 'Slide 2 - Subtitle', type: 'textarea', placeholder: 'Handcrafted silks...', rows: 2 },
      { key: 'slide2_cta', label: 'Slide 2 - Button Text', type: 'text', placeholder: 'Explore' },
      { key: 'slide3_label', label: 'Slide 3 - Label', type: 'text', placeholder: 'Festive Season' },
      { key: 'slide3_title', label: 'Slide 3 - Title', type: 'text', placeholder: 'Celebrate in Style' },
      { key: 'slide3_subtitle', label: 'Slide 3 - Subtitle', type: 'textarea', placeholder: 'Kurtis, lehengas...', rows: 2 },
      { key: 'slide3_cta', label: 'Slide 3 - Button Text', type: 'text', placeholder: 'Shop Festive' },
    ],
  },
  { key: 'store_info', title: 'Store Info', icon: Home, description: 'General store settings',
    fields: [
      { key: 'store_name', label: 'Store Name', type: 'text', placeholder: 'Avyuktha Fashions' },
      { key: 'tagline', label: 'Tagline', type: 'text', placeholder: 'Where Heritage Meets Modern Elegance' },
      { key: 'support_email', label: 'Support Email', type: 'email', placeholder: 'support@avyukthafashions.com' },
      { key: 'support_phone', label: 'Support Phone', type: 'phone', placeholder: '+91 98765 43210' },
      { key: 'instagram', label: 'Instagram URL', type: 'url', placeholder: 'https://instagram.com/avyukthafashions' },
      { key: 'facebook', label: 'Facebook URL', type: 'url', placeholder: 'https://facebook.com/avyukthafashions' },
    ],
  },
];

export default function CmsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const def = PAGES.find((p) => p.key === selected);

  const loadPage = async (key: string) => {
    setSelected(key);
    setLoading(true);
    setSaved(false);
    try {
      const { data } = await cmsApi.get(key);
      const content = data.data?.content || {};
      const flat: Record<string, string> = {};
      if (typeof content === 'object' && content !== null) {
        Object.entries(content).forEach(([k, v]) => { flat[k] = typeof v === 'string' ? v : String(v); });
      }
      setFieldValues(flat);
    } catch { setFieldValues({}); } finally { setLoading(false); }
  };

  const save = async () => {
    if (!selected || !def) return;
    setSaving(true);
    try {
      await cmsApi.upsert(selected, { title: def.title, content: fieldValues });
      setSaved(true);
      toast.success(`${def.title} saved`);
      setTimeout(() => setSaved(false), 3000);
    } catch {} finally { setSaving(false); }
  };

  const set = (key: string, value: string) => { setFieldValues((p) => ({ ...p, [key]: value })); setSaved(false); };

  return (
    <div className="flex gap-5" style={{ minHeight: '70vh' }}>
      <aside className="w-52 flex-shrink-0">
        <div className="card p-2 sticky top-20">
          <p className="font-body text-[9px] font-bold text-brand-muted uppercase tracking-wider px-3 py-1 mb-1">Pages</p>
          {PAGES.map(({ key, title, icon: Icon }) => (
            <button key={key} onClick={() => loadPage(key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 font-body text-[12px] rounded-lg text-left transition-all mb-0.5 ${
                selected === key ? 'bg-primary/10 text-primary font-semibold' : 'text-brand-text hover:bg-brand-bg'
              }`}>
              <Icon size={13} className={selected === key ? 'text-primary' : 'text-brand-muted'} />
              <span className="truncate">{title}</span>
            </button>
          ))}
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        {!selected ? (
          <div className="card flex flex-col items-center justify-center min-h-[400px] text-center">
            <Globe size={36} className="text-brand-border mb-3" />
            <p className="font-body text-sm font-semibold text-brand-text">Select a page to edit</p>
            <p className="font-body text-xs text-brand-muted mt-1">Click any page from the left panel</p>
          </div>
        ) : loading ? (
          <div className="card flex items-center justify-center min-h-[300px]">
            <span className="w-7 h-7 border-2 border-brand-border border-t-primary rounded-full animate-spin" />
          </div>
        ) : def ? (
          <div className="space-y-4">
            <div className="card flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <def.icon size={16} className="text-primary" />
                </div>
                <div>
                  <h2 className="font-body text-sm font-semibold text-brand-text">{def.title}</h2>
                  <p className="font-body text-xs text-brand-muted">{def.description}</p>
                </div>
              </div>
              <button onClick={save} disabled={saving}
                className={`btn-primary ${saved ? '!bg-green-500 !shadow-none' : ''}`}>
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : saved ? <><Check size={14} /> Saved</>
                  : <><Save size={14} /> Save Changes</>}
              </button>
            </div>

            <div className="card space-y-5">
              {def.fields.map((field) => (
                <div key={field.key}>
                  <label className="input-label">{field.label}</label>
                  {field.type === 'textarea' || field.type === 'richtext' ? (
                    <div>
                      <textarea
                        value={fieldValues[field.key] || ''}
                        onChange={(e) => set(field.key, e.target.value)}
                        rows={field.rows || 4}
                        placeholder={field.placeholder}
                        className={`input-field resize-y ${field.type === 'richtext' ? 'font-mono text-xs' : ''}`}
                      />
                      {field.type === 'richtext' && (
                        <p className="mt-1 flex items-center gap-1 font-body text-[11px] text-brand-muted">
                          <AlertCircle size={10} />
                          HTML supported: &lt;h2&gt; &lt;h3&gt; &lt;p&gt; &lt;strong&gt; &lt;em&gt; &lt;ul&gt; &lt;li&gt;
                        </p>
                      )}
                    </div>
                  ) : (
                    <input
                      type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
                      value={fieldValues[field.key] || ''}
                      onChange={(e) => set(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="input-field"
                    />
                  )}
                  {field.help && <p className="mt-1 font-body text-[11px] text-blue-500">{field.help}</p>}
                </div>
              ))}
            </div>

            <div className="flex justify-end pb-4">
              <button onClick={save} disabled={saving} className={`btn-primary ${saved ? '!bg-green-500' : ''}`}>
                {saving ? 'Saving...' : saved ? 'All Saved!' : 'Save Changes'}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
