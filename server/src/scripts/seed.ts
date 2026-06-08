import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import User from '../models/User';
import Category from '../models/Category';
import Collection from '../models/Collection';
import ProductType from '../models/ProductType';
import Attribute from '../models/Attribute';
import Product from '../models/Product';
import Coupon from '../models/Coupon';
import Announcement from '../models/Announcement';
import Blog from '../models/Blog';
import Review from '../models/Review';
import Newsletter from '../models/Newsletter';
import CmsPage from '../models/CmsPage';
import AuditLog from '../models/AuditLog';
import Order from '../models/Order';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/avyuktha_fashions';

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ─── SEED (config only — no demo products / orders / reviews) ────────────────
async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear everything (products/orders/reviews are wiped but not re-created)
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Collection.deleteMany({}),
    ProductType.deleteMany({}),
    Attribute.deleteMany({}),
    Product.deleteMany({}),
    Coupon.deleteMany({}),
    Announcement.deleteMany({}),
    Blog.deleteMany({}),
    Review.deleteMany({}),
    Newsletter.deleteMany({}),
    CmsPage.deleteMany({}),
    AuditLog.deleteMany({}),
    Order.deleteMany({}),
  ]);
  console.log('Cleared all collections');

  // ── Users: one admin (full control) + a couple of customers ─────────────────
  const passwordHash = await bcrypt.hash('Admin@123', 12);
  const customerHash = await bcrypt.hash('Customer@123', 12);

  const [admin] = await User.insertMany([
    { name: 'Admin', email: 'admin@avyuktha.com', password: passwordHash, role: 'admin', isEmailVerified: true, isActive: true, phone: '9876543210' },
    { name: 'Priya Sharma', email: 'priya@example.com', password: customerHash, role: 'customer', isEmailVerified: true, isActive: true, phone: '9876500001' },
    { name: 'Anitha Reddy', email: 'anitha@example.com', password: customerHash, role: 'customer', isEmailVerified: true, isActive: true, phone: '9876500002' },
  ]);
  console.log('Users created');

  // ── Categories ──────────────────────────────────────────────────────────────
  const catData = [
    { name: 'Sarees', productType: 'clothing', description: 'Premium Indian sarees from across the country', sortOrder: 1 },
    { name: 'Silk Sarees', productType: 'clothing', description: 'Handwoven silk sarees in Kanjeevaram, Banarasi and more', sortOrder: 2 },
    { name: 'Cotton Sarees', productType: 'clothing', description: 'Lightweight and breathable cotton sarees', sortOrder: 3 },
    { name: 'Designer Sarees', productType: 'clothing', description: 'Contemporary designer sarees for special occasions', sortOrder: 4 },
    { name: 'Kurtis', productType: 'clothing', description: 'Versatile kurtis for every occasion', sortOrder: 5 },
    { name: 'Kurta Sets', productType: 'clothing', description: 'Matching kurta and bottom sets', sortOrder: 6 },
    { name: 'Lehengas', productType: 'clothing', description: 'Bridal and festive lehengas', sortOrder: 7 },
    { name: 'Salwar Suits', productType: 'clothing', description: 'Classic and contemporary salwar suits', sortOrder: 8 },
    { name: 'Tops', productType: 'clothing', description: 'Trendy tops for casual and formal wear', sortOrder: 9 },
    { name: 'Dresses', productType: 'clothing', description: 'Western dresses for all occasions', sortOrder: 10 },
    { name: 'Jeans & Trousers', productType: 'clothing', description: 'Modern western bottoms', sortOrder: 11 },
    { name: 'Co-Ord Sets', productType: 'clothing', description: 'Matching top and bottom co-ordinate sets', sortOrder: 12 },
    // Jewellery
    { name: 'Necklaces', productType: 'jewellery', description: '1 gram gold, rolled gold and silver necklaces', sortOrder: 13 },
    { name: 'Earrings', productType: 'jewellery', description: 'Studs, jhumkas and danglers', sortOrder: 14 },
    { name: 'Bangles', productType: 'jewellery', description: 'Traditional and contemporary bangles', sortOrder: 15 },
    // Gifting
    { name: 'Return Gifts', productType: 'return-gift', description: 'Indian return gift items for functions', sortOrder: 16 },
  ];
  const categories = await Category.insertMany(catData.map((c) => ({ ...c, slug: slug(c.name), isActive: true })));
  console.log('Categories created');

  // ── Collections ───────────────────────────────────────────────────────────
  const collData = [
    { name: 'Wedding Collection', description: 'Exquisite pieces for your wedding and special occasions', isFeatured: true, sortOrder: 1 },
    { name: 'Festive Collection', description: 'Celebrate every festival in style', isFeatured: true, sortOrder: 2 },
    { name: 'New Arrivals', description: 'Fresh additions to our catalogue', isFeatured: true, sortOrder: 3 },
    { name: 'Summer Essentials', description: 'Light, breezy and stylish summer picks', isFeatured: false, sortOrder: 4 },
    { name: 'Diwali Collection', description: 'Shimmer and shine this Diwali season', isFeatured: true, sortOrder: 5 },
    { name: 'Office Wear', description: 'Professional and elegant office attire', isFeatured: false, sortOrder: 6 },
    { name: 'Bridal Trousseau', description: 'Complete bridal wardrobe essentials', isFeatured: true, sortOrder: 7 },
  ];
  const collections = await Collection.insertMany(collData.map((c) => ({ ...c, slug: slug(c.name), isActive: true })));
  console.log('Collections created');

  // ── Product Types (admin-managed) ───────────────────────────────────────────
  await ProductType.insertMany(
    [
      { name: 'Clothing', sortOrder: 1 },
      { name: 'Jewellery', sortOrder: 2 },
      { name: 'Return Gift', sortOrder: 3 },
      { name: 'Accessory', sortOrder: 4 },
    ].map((t) => ({ ...t, slug: slug(t.name), isActive: true }))
  );
  console.log('Product types created');

  // ── Attributes (dynamic taxonomy) ───────────────────────────────────────────
  const opt = (vals: string[]) => vals.map((v, i) => ({ label: v, value: v, sortOrder: i }));
  const colorOpt = (pairs: [string, string][]) =>
    pairs.map(([label, hex], i) => ({ label, value: label, hex, sortOrder: i }));
  await Attribute.insertMany([
    { name: 'Size', slug: 'size', level: 'variant', inputType: 'chips', isFilterable: true, isActive: true, productTypes: ['clothing'], sortOrder: 1, options: opt(['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size']) },
    { name: 'Colour', slug: 'color', level: 'variant', inputType: 'color', isFilterable: true, isActive: true, productTypes: [], sortOrder: 2, options: colorOpt([['Red', '#EF4444'], ['Blue', '#3B82F6'], ['Green', '#22C55E'], ['Pink', '#EC4899'], ['Black', '#111827'], ['White', '#F9FAFB'], ['Gold', '#C8A97E'], ['Beige', '#D4A57C']]) },
    { name: 'Fabric', slug: 'fabric', level: 'product', inputType: 'chips', isFilterable: true, isActive: true, productTypes: ['clothing'], sortOrder: 3, options: opt(['Silk', 'Cotton', 'Georgette', 'Chiffon', 'Linen', 'Velvet', 'Net', 'Crepe', 'Satin']) },
    { name: 'Metal', slug: 'metal', level: 'product', inputType: 'select', isFilterable: true, isActive: true, productTypes: ['jewellery', 'return-gift'], sortOrder: 4, options: opt(['1 Gram Gold', 'Rolled Gold', 'Original Silver', 'Imitation']) },
    { name: 'Purity', slug: 'purity', level: 'product', inputType: 'chips', isFilterable: true, isActive: true, productTypes: ['jewellery'], sortOrder: 5, options: opt(['22K', '18K', '92.5 Silver', 'Gold Plated']) },
    { name: 'Occasion', slug: 'occasion', level: 'product', inputType: 'chips', isFilterable: true, isActive: true, productTypes: [], sortOrder: 6, options: opt(['Wedding', 'Festive', 'Daily Wear', 'Party', 'Return Gift', 'Bridal']) },
  ]);
  console.log('Attributes created');

  // ── Coupons ─────────────────────────────────────────────────────────────────
  const now = new Date();
  const futureDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const nearFuture = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await Coupon.insertMany([
    { code: 'WELCOME10', type: 'percentage', value: 10, minOrderValue: 999, maxDiscount: 500, usageLimit: 1000, perUserLimit: 1, startDate: now, expiryDate: futureDate, isActive: true, description: '10% off on your first order' },
    { code: 'FLAT500', type: 'flat', value: 500, minOrderValue: 2999, usageLimit: 500, perUserLimit: 2, startDate: now, expiryDate: futureDate, isActive: true, description: 'Flat ₹500 off on orders above ₹2999' },
    { code: 'FREESHIP', type: 'free_shipping', value: 0, minOrderValue: 499, usageLimit: 2000, perUserLimit: 5, startDate: now, expiryDate: futureDate, isActive: true, description: 'Free shipping on all orders above ₹499' },
    { code: 'DIWALI15', type: 'festival', value: 15, minOrderValue: 1999, maxDiscount: 1500, usageLimit: 1000, perUserLimit: 2, startDate: now, expiryDate: nearFuture, isActive: true, description: 'Diwali special — 15% off' },
  ]);
  console.log('Coupons created');

  // ── Announcements ──────────────────────────────────────────────────────────
  await Announcement.insertMany([
    { title: 'Free Shipping', content: '🎉 Free Shipping on orders above ₹999 | Use code FREESHIP', type: 'top_bar', startDate: now, expiryDate: futureDate, isActive: true, bgColor: '#C8A97E', textColor: '#FFFFFF', ctaText: 'Shop Now', ctaLink: '/products' },
    { title: 'Welcome Popup', content: 'Welcome to Avyuktha Fashions! Get 10% off your first order with code WELCOME10', type: 'popup', ctaText: 'Shop Now', ctaLink: '/products', startDate: now, expiryDate: futureDate, isActive: true, bgColor: '#1C1C1C', textColor: '#FFFFFF' },
    { title: 'Diwali Sale', content: '✨ Diwali Special — Up to 25% off on ethnic wear! Limited time only', type: 'flash_sale', startDate: now, expiryDate: nearFuture, isActive: true, bgColor: '#D8A7B1', textColor: '#1C1C1C', ctaText: 'Grab Now', ctaLink: '/products?collection=diwali-collection' },
  ]);
  console.log('Announcements created');

  // ── Blogs ────────────────────────────────────────────────────────────────────
  await Blog.insertMany([
    {
      title: 'How to Style a Kanjeevaram Saree for Modern Occasions',
      slug: 'how-to-style-kanjeevaram-saree-modern-occasions',
      excerpt: 'The Kanjeevaram saree has been a bridal staple for centuries. Here is your complete guide to styling it for contemporary settings.',
      content: `<h2>The Timeless Kanjeevaram</h2><p>The Kanjeevaram saree, woven in Kanchipuram, is one of India's most prized silk traditions.</p><h2>Modern Styling Tips</h2><ul><li><strong>Belt it up</strong></li><li><strong>The dhoti drape</strong></li><li><strong>Cape blouse</strong></li><li><strong>Minimalist jewellery</strong></li></ul>`,
      coverImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=80',
      author: admin._id,
      category: 'Style Guide',
      tags: ['kanjeevaram', 'saree styling', 'bridal', 'silk'],
      isPublished: true,
      publishedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'A Guide to Indian Handloom Fabrics Every Woman Should Know',
      slug: 'guide-to-indian-handloom-fabrics',
      excerpt: 'From Mysore silk to Chanderi, here is your definitive guide to the fabrics that define Indian fashion.',
      content: `<h2>India's Handloom Heritage</h2><p>India's handloom industry is the world's largest.</p><h3>Kanjeevaram Silk</h3><p>Heavy weight, rich zari borders.</p><h3>Banarasi Silk</h3><p>Intricate brocade with gold and silver thread.</p><h3>Chanderi</h3><p>Lightweight silk-cotton blend.</p>`,
      coverImage: 'https://images.unsplash.com/photo-1614093302611-8efc4c438a87?w=1200&q=80',
      author: admin._id,
      category: 'Fashion Education',
      tags: ['handloom', 'indian textiles', 'silk', 'fabric guide'],
      isPublished: true,
      publishedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
    },
  ]);
  console.log('Blogs created');

  // ── Newsletter ─────────────────────────────────────────────────────────────
  await Newsletter.insertMany([
    { email: 'newsletter1@example.com', isSubscribed: true, source: 'website' },
    { email: 'newsletter2@example.com', isSubscribed: true, source: 'popup' },
    { email: 'priya@example.com', isSubscribed: true, source: 'website' },
  ]);
  console.log('Newsletter subscribers created');

  // ── CMS Pages ──────────────────────────────────────────────────────────────
  await CmsPage.insertMany([
    {
      key: 'homepage_hero',
      title: 'Homepage Hero',
      content: {
        slides: [
          { title: 'Elegance\nRedefined', subtitle: 'Discover premium ethnic and western wear', label: 'New Collection 2025', ctaLabel: 'Shop Now', ctaHref: '/products' },
          { title: 'Bridal\nSplendour', subtitle: 'Handcrafted silk sarees for your special day', label: 'Wedding Collection', ctaLabel: 'Explore', ctaHref: '/products?collection=wedding-collection' },
        ],
      },
      lastUpdatedBy: admin._id,
    },
    {
      key: 'about',
      title: 'About Us',
      content: {
        heading: 'Our Story',
        body: 'Born from a deep love for Indian textiles and craftsmanship, Avyuktha Fashions bridges traditional weaves with contemporary silhouettes.',
        stats: [{ label: 'Products', value: '5000+' }, { label: 'Happy Customers', value: '50K+' }, { label: 'Years', value: '12+' }],
      },
      lastUpdatedBy: admin._id,
    },
    {
      key: 'privacy', title: 'Privacy Policy',
      content: `<h2>Privacy Policy</h2><p>We are committed to protecting your privacy.</p>`,
      lastUpdatedBy: admin._id,
    },
    {
      key: 'terms', title: 'Terms of Service',
      content: `<h2>Terms of Service</h2><p>By using Avyuktha Fashions, you agree to these terms.</p>`,
      lastUpdatedBy: admin._id,
    },
    {
      key: 'returns', title: 'Return Policy',
      content: `<h2>Return & Refund Policy</h2><p>Hassle-free returns within 7 days of delivery.</p>`,
      lastUpdatedBy: admin._id,
    },
    {
      key: 'shipping', title: 'Shipping Policy',
      content: `<h2>Shipping Policy</h2><p>Free standard shipping on all orders above ₹999.</p>`,
      lastUpdatedBy: admin._id,
    },
  ]);
  console.log('CMS pages created');

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n✅ Seed complete!\n');
  console.log('─'.repeat(50));
  console.log('ADMIN LOGIN:');
  console.log('  admin@avyuktha.com / Admin@123');
  console.log('CUSTOMER LOGIN:');
  console.log('  priya@example.com / Customer@123');
  console.log('─'.repeat(50));
  console.log(`Categories: ${categories.length}`);
  console.log(`Collections: ${collections.length}`);
  console.log('Product types: 4 | Attributes: 6');
  console.log('Products / Orders / Reviews: none (add via admin panel)');
  console.log('─'.repeat(50));

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
