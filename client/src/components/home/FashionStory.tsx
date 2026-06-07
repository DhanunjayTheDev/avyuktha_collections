import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Award, Leaf, Heart } from 'lucide-react';

const PILLARS = [
  { icon: Award, title: 'Certified Authentic', body: 'Every product verified for quality and authenticity by our expert team.' },
  { icon: Leaf, title: 'Sustainably Sourced', body: 'We work with artisans who use ethical and eco-friendly practices.' },
  { icon: Heart, title: 'Made with Love', body: 'Each piece tells the story of a skilled weaver and their craft.' },
];

export default function FashionStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.7, 1, 1, 0.7]);

  return (
    <section ref={sectionRef} className="page-section overflow-hidden bg-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 xl:gap-24 items-center">
          {/* Image with parallax */}
          <div ref={imgRef} className="relative aspect-[4/5] overflow-hidden order-2 lg:order-1">
            <motion.img
              style={{ y, opacity }}
              src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=900&q=80"
              alt="Fashion story"
              className="absolute inset-0 w-full h-[120%] -top-[10%] object-cover"
              loading="lazy"
            />
            {/* Floating stat card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="absolute bottom-6 right-4 bg-brand-bg/98 backdrop-blur-sm p-5 shadow-luxury max-w-[160px]"
            >
              <p className="font-heading text-4xl font-bold text-primary leading-none">12+</p>
              <p className="font-body text-xs text-brand-muted mt-1.5 leading-snug">Years of Crafting Excellence</p>
            </motion.div>
            {/* Decorative border */}
            <div className="absolute -bottom-3 -left-3 w-2/3 h-2/3 border-2 border-primary/20 pointer-events-none hidden sm:block" />
          </div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="order-1 lg:order-2"
          >
            <p className="section-label mb-4">Our Story</p>
            <h2 className="heading-md text-brand-text mb-5 text-balance">
              Where Heritage<br />Meets Modern Elegance
            </h2>
            <p className="font-body text-brand-muted leading-relaxed mb-4 text-sm sm:text-base">
              Born from a deep love for Indian textiles and craftsmanship, Avyuktha Fashions bridges the timeless beauty of traditional weaves with contemporary silhouettes designed for today's woman.
            </p>
            <p className="font-body text-brand-muted leading-relaxed mb-8 text-sm sm:text-base">
              Every piece in our collection tells a story — of skilled artisans, of rich heritage, and of a woman who carries grace in every step she takes.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8 py-6 border-y border-brand-border">
              {[
                { value: '5000+', label: 'Styles' },
                { value: '50K+', label: 'Customers' },
                { value: '4.8★', label: 'Rating' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-heading text-2xl sm:text-3xl font-bold text-primary">{stat.value}</p>
                  <p className="font-body text-xs text-brand-muted mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Pillars */}
            <div className="space-y-3 mb-8">
              {PILLARS.map(({ icon: Icon, title, body }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-8 h-8 bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={15} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-body text-sm font-semibold text-brand-text">{title}</p>
                    <p className="font-body text-xs text-brand-muted mt-0.5">{body}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Link to="/cms/about" className="btn-outline self-start">
              Our Story <ArrowRight size={15} />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
