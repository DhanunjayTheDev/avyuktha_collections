import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SectionHeader from '../common/SectionHeader';
import { ArrowRight } from 'lucide-react';

const CATEGORIES = [
  { name: 'Silk Sarees', slug: 'silk-sarees', count: '240+', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80', color: '#C8A97E' },
  { name: 'Kurtis', slug: 'kurtis', count: '180+', image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=600&q=80', color: '#D8A7B1' },
  { name: 'Lehengas', slug: 'lehengas', count: '120+', image: 'https://images.unsplash.com/photo-1614093302611-8efc4c438a87?w=600&q=80', color: '#A8864A' },
  { name: 'Western', slug: 'western', count: '300+', image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80', color: '#C8A97E' },
  { name: 'Dresses', slug: 'dresses', count: '90+', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80', color: '#D8A7B1' },
  { name: 'Co-Ord Sets', slug: 'co-ord-sets', count: '60+', image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&q=80', color: '#A8864A' },
];

// Featured category banners
const FEATURED = [
  {
    title: 'Wedding Collection',
    subtitle: 'Silks & Lehengas',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
    href: '/products?collection=wedding-collection',
    span: 'col-span-2 row-span-2',
  },
  {
    title: 'New Arrivals',
    subtitle: 'Fresh every week',
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=600&q=80',
    href: '/products?isNewArrival=true',
    span: 'col-span-1 row-span-1',
  },
  {
    title: 'Festive Wear',
    subtitle: 'Season specials',
    image: 'https://images.unsplash.com/photo-1614093302611-8efc4c438a87?w=600&q=80',
    href: '/products?collection=festive-collection',
    span: 'col-span-1 row-span-1',
  },
];

export default function ShopByCategory() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section ref={sectionRef} className="page-section bg-brand-surface overflow-hidden">
      <div className="container-custom">
        <SectionHeader label="Browse" title="Shop By Category" subtitle="Explore our curated collections across every style and occasion" />

        {/* Category circles — scroll snap on mobile */}
        <div className="overflow-hidden sm:overflow-visible -mx-4 sm:mx-0">
        <div className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory sm:grid sm:grid-cols-3 md:grid-cols-6 sm:overflow-visible sm:pb-0 px-4 sm:px-0">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="flex-shrink-0 snap-start w-[110px] xs:w-[120px] sm:w-auto"
            >
              <Link to={`/products?search=${cat.name}`} className="group block text-center">
                <div className="relative overflow-hidden rounded-full aspect-square mx-auto mb-3 bg-brand-border"
                  style={{ maxWidth: '100px' }}>
                  <img src={cat.image} alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy" />
                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `${cat.color}33` }} />
                </div>
                <h3 className="font-body text-xs sm:text-sm font-semibold text-brand-text group-hover:text-primary transition-colors leading-tight">{cat.name}</h3>
                <p className="font-body text-[11px] text-brand-muted mt-0.5">{cat.count}</p>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Featured grid — desktop */}
        <div className="hidden md:grid grid-cols-3 grid-rows-2 gap-4 mt-12" style={{ height: '420px' }}>
          {FEATURED.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`${f.span} relative overflow-hidden group cursor-pointer`}
            >
              <Link to={f.href} className="block w-full h-full">
                <img src={f.image} alt={f.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-text/70 via-brand-text/10 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="font-body text-[10px] tracking-[0.25em] uppercase text-primary mb-1">{f.subtitle}</p>
                  <h3 className="font-heading text-xl font-bold text-white">{f.title}</h3>
                </div>
                <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight size={14} className="text-white" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        </div>

        {/* Mobile featured — horizontal scroll */}
        <div className="md:hidden overflow-hidden -mx-4 mt-8">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-4 snap-x snap-mandatory">
          {FEATURED.map((f) => (
            <Link key={f.title} to={f.href} className="flex-shrink-0 snap-start relative overflow-hidden w-64 h-40">
              <img src={f.image} alt={f.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-text/70 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="font-body text-[9px] tracking-[0.2em] uppercase text-primary mb-0.5">{f.subtitle}</p>
                <h3 className="font-heading text-base font-bold text-white">{f.title}</h3>
              </div>
            </Link>
          ))}
        </div>
        </div>
      </div>
    </section>
  );
}
