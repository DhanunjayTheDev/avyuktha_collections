import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1920&q=80',
    label: 'New Collection 2025',
    title: ['Elegance', 'Redefined'],
    subtitle: 'Discover premium ethnic and western wear curated for the modern Indian woman.',
    cta: { label: 'Shop Now', href: '/products' },
    ctaSecondary: { label: 'View Collections', href: '/collections' },
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=1920&q=80',
    label: 'Wedding Collection',
    title: ['Bridal', 'Splendour'],
    subtitle: 'Handcrafted Kanjeevaram and Banarasi silks for your most precious day.',
    cta: { label: 'Explore Bridal', href: '/products?search=silk sarees' },
    ctaSecondary: { label: 'View Lookbook', href: '/blogs' },
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1614093302611-8efc4c438a87?w=1920&q=80',
    label: 'Festive Season',
    title: ['Celebrate', 'in Style'],
    subtitle: 'Kurtis, lehengas and co-ords curated for every festive occasion.',
    cta: { label: 'Shop Festive', href: '/products?collection=festive-collection' },
    ctaSecondary: { label: 'New Arrivals', href: '/products?isNewArrival=true' },
  },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setCurrent((c) => (c + 1) % SLIDES.length);
    }, 6000);
  };

  useEffect(() => {
    startInterval();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const goTo = (idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
    startInterval();
  };

  const slide = SLIDES[current];

  return (
    <section
      className="relative w-full overflow-hidden bg-brand-text"
      style={{ height: 'calc(100svh)', minHeight: '580px', maxHeight: '900px' }}
    >
      {/* BG Images */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0"
        >
          <img src={slide.image} alt="" className="absolute inset-0 w-full h-full object-cover object-center" loading="eager" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(28,28,28,0.75) 0%, rgba(28,28,28,0.3) 50%, transparent 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(28,28,28,0.6) 0%, transparent 50%)' }} />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end sm:justify-center container-custom pb-20 sm:pb-0 pt-24 sm:pt-28 md:pt-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${current}`}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="max-w-xs xs:max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-2xl"
          >
            <motion.p
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="section-label text-primary mb-3 sm:mb-4"
            >
              {slide.label}
            </motion.p>

            <h1
              className="font-heading font-bold text-white leading-[1.02] tracking-tight mb-4 sm:mb-5"
              style={{ fontSize: 'clamp(2.75rem, 10vw, 5.5rem)' }}
            >
              {slide.title[0]}<br />
              <span className="italic">{slide.title[1]}</span>
            </h1>

            <p
              className="font-body text-white/80 leading-relaxed mb-7 sm:mb-9 max-w-xs sm:max-w-sm"
              style={{ fontSize: 'clamp(0.875rem, 2vw, 1.0625rem)' }}
            >
              {slide.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                to={slide.cta.href}
                className="inline-flex items-center gap-2 bg-primary text-white font-body font-medium tracking-widest text-xs uppercase px-6 py-3.5 hover:bg-primary-dark transition-colors duration-200 active:scale-[0.98]"
                style={{ minHeight: '44px' }}
              >
                {slide.cta.label}
                <ArrowRight size={14} />
              </Link>
              <Link
                to={slide.ctaSecondary.href}
                className="inline-flex items-center gap-2 font-body text-xs tracking-[0.2em] uppercase text-white border-b border-white/40 pb-0.5 hover:border-primary hover:text-primary transition-colors duration-200"
                style={{ minHeight: '44px' }}
              >
                {slide.ctaSecondary.label}
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              className={`transition-all duration-300 rounded-full ${i === current ? 'w-6 h-2 bg-primary' : 'w-2 h-2 bg-white/40 hover:bg-white/70'}`}
            />
          ))}
        </div>
      </div>

      {/* Prev/Next — desktop only */}
      <button onClick={() => goTo((current - 1 + SLIDES.length) % SLIDES.length)}
        className="absolute left-5 md:left-8 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-colors hidden sm:flex"
        aria-label="Previous slide">
        <ChevronLeft size={20} />
      </button>
      <button onClick={() => goTo((current + 1) % SLIDES.length)}
        className="absolute right-5 md:right-8 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition-colors hidden sm:flex"
        aria-label="Next slide">
        <ChevronRight size={20} />
      </button>

      {/* Scroll indicator — desktop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 right-8 hidden lg:flex flex-col items-center gap-2"
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 1.8, repeat: Infinity }}
          className="w-px h-10 bg-gradient-to-b from-white/60 to-transparent" />
        <span className="font-body text-[9px] tracking-[0.3em] uppercase text-white/50 [writing-mode:vertical-lr]">Scroll</span>
      </motion.div>
    </section>
  );
}
