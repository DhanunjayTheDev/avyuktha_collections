import { useEffect, useState } from 'react';
import HeroSection from '../components/home/HeroSection';
import ProductRow from '../components/home/ProductRow';
import ShopByCategory from '../components/home/ShopByCategory';
import FashionStory from '../components/home/FashionStory';
import CollectionBanner from '../components/home/CollectionBanner';
import Testimonials from '../components/home/Testimonials';
import NewsletterSection from '../components/home/NewsletterSection';
import InfiniteMarquee from '../components/home/InfiniteMarquee';
import { productApi } from '../api/product.api';
import type { Product } from '../types';

const MARQUEE_ITEMS = [
  'Silk Sarees', 'Designer Kurtis', 'Bridal Lehengas', 'Co-Ord Sets',
  'Festive Collection', 'Premium Fabrics', 'Free Shipping ₹999+',
];

export default function HomePage() {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [na, bs, tr] = await Promise.all([
          productApi.getProducts({ isNewArrival: true, limit: 10 }),
          productApi.getProducts({ isBestSeller: true, limit: 10 }),
          productApi.getProducts({ isTrending: true, limit: 10 }),
        ]);
        setNewArrivals(na.data.data || []);
        setBestSellers(bs.data.data || []);
        setTrending(tr.data.data || []);
      } catch {}
      setLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <>
      <HeroSection />

      <InfiniteMarquee items={MARQUEE_ITEMS} />

      <ProductRow
        label="Fresh Drops"
        title="New Arrivals"
        subtitle="First looks at the latest additions to our collection"
        products={newArrivals}
        isLoading={loading}
        viewAllHref="/products?isNewArrival=true"
      />

      <ShopByCategory />

      <CollectionBanner
        label="Crafted in Silk"
        title="The Wedding Collection"
        subtitle="Handwoven Kanjeevaram and Banarasi silks, designed for the most precious moments of your life."
        image="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&q=80"
        href="/products?search=silk sarees"
        cta="Explore Wedding Sarees"
        dark
      />

      <ProductRow
        label="Top Picks"
        title="Best Sellers"
        subtitle="The pieces our customers can't stop talking about"
        products={bestSellers}
        isLoading={loading}
        viewAllHref="/products?isBestSeller=true"
      />

      <CollectionBanner
        label="Festive Season"
        title="Celebrate in Full Colour"
        subtitle="Lehengas, kurta sets, and co-ords curated for Diwali, Navratri, Eid, and every festive occasion."
        image="https://images.unsplash.com/photo-1614093302611-8efc4c438a87?w=1000&q=80"
        href="/products?collection=festive"
        cta="Shop Festive Wear"
        reverse
      />

      <ProductRow
        label="What's Hot"
        title="Trending Now"
        products={trending}
        isLoading={loading}
        viewAllHref="/products?isTrending=true"
      />

      <FashionStory />

      <Testimonials />

      <InfiniteMarquee items={MARQUEE_ITEMS} reverse />

      <NewsletterSection />
    </>
  );
}
