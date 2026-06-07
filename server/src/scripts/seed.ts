import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import User from '../models/User';
import Category from '../models/Category';
import Collection from '../models/Collection';
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

// ─── HELPERS ────────────────────────────────────────────────────────────────

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const CLOUDINARY_BASE = 'https://images.unsplash.com';

const productImages = {
  saree1: [`${CLOUDINARY_BASE}/photo-1610030469983-98e550d6193c?w=800&q=80`, `${CLOUDINARY_BASE}/photo-1610030469983-98e550d6193c?w=800&q=80`],
  saree2: [`${CLOUDINARY_BASE}/photo-1583391733956-6c78276477e1?w=800&q=80`, `${CLOUDINARY_BASE}/photo-1583391733956-6c78276477e1?w=800&q=80`],
  saree3: [`${CLOUDINARY_BASE}/photo-1614093302611-8efc4c438a87?w=800&q=80`],
  kurti1: [`${CLOUDINARY_BASE}/photo-1595777457583-95e059d581b8?w=800&q=80`],
  kurti2: [`${CLOUDINARY_BASE}/photo-1485968579580-b6d095142e6e?w=800&q=80`],
  lehenga1: [`${CLOUDINARY_BASE}/photo-1539109136881-3be0616acf4b?w=800&q=80`],
  western1: [`${CLOUDINARY_BASE}/photo-1496747611176-843222e1e57c?w=800&q=80`],
  western2: [`${CLOUDINARY_BASE}/photo-1539109136881-3be0616acf4b?w=800&q=80`],
  dress1: [`${CLOUDINARY_BASE}/photo-1515372039744-b8f02a3ae446?w=800&q=80`],
  coord1: [`${CLOUDINARY_BASE}/photo-1602293589930-45aad59ba3ab?w=800&q=80`],
};

// ─── SEED ────────────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear all collections
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Collection.deleteMany({}),
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

  // ── Users ─────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Admin@123', 12);
  const customerHash = await bcrypt.hash('Customer@123', 12);

  const [superAdmin, admin, manager, contentEditor, supportExec, ...customers] = await User.insertMany([
    {
      name: 'Dhanu (Super Admin)',
      email: 'superadmin@avyuktha.com',
      password: passwordHash,
      role: 'super_admin',
      isEmailVerified: true,
      isActive: true,
      phone: '9876543210',
    },
    {
      name: 'Admin User',
      email: 'admin@avyuktha.com',
      password: passwordHash,
      role: 'admin',
      isEmailVerified: true,
      isActive: true,
    },
    {
      name: 'Priya Manager',
      email: 'manager@avyuktha.com',
      password: passwordHash,
      role: 'manager',
      isEmailVerified: true,
      isActive: true,
    },
    {
      name: 'Anitha Editor',
      email: 'editor@avyuktha.com',
      password: passwordHash,
      role: 'content_editor',
      isEmailVerified: true,
      isActive: true,
    },
    {
      name: 'Support Team',
      email: 'support@avyuktha.com',
      password: passwordHash,
      role: 'support_executive',
      isEmailVerified: true,
      isActive: true,
    },
    // Customers
    { name: 'Priya Sharma', email: 'priya@example.com', password: customerHash, role: 'customer', isEmailVerified: true, isActive: true, phone: '9876500001',
      addresses: [{ label: 'Home', fullName: 'Priya Sharma', phone: '9876500001', line1: '12 MG Road', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', country: 'India', isDefault: true }] },
    { name: 'Anitha Reddy', email: 'anitha@example.com', password: customerHash, role: 'customer', isEmailVerified: true, isActive: true, phone: '9876500002',
      addresses: [{ label: 'Home', fullName: 'Anitha Reddy', phone: '9876500002', line1: '45 Jubilee Hills', city: 'Hyderabad', state: 'Telangana', pincode: '500033', country: 'India', isDefault: true }] },
    { name: 'Meena Krishnan', email: 'meena@example.com', password: customerHash, role: 'customer', isEmailVerified: true, isActive: true, phone: '9876500003' },
    { name: 'Deepa Nair', email: 'deepa@example.com', password: customerHash, role: 'customer', isEmailVerified: true, isActive: true, phone: '9876500004' },
    { name: 'Kavya Patel', email: 'kavya@example.com', password: customerHash, role: 'customer', isEmailVerified: true, isActive: true, phone: '9876500005' },
    { name: 'Sneha Joshi', email: 'sneha@example.com', password: customerHash, role: 'customer', isEmailVerified: true, isActive: true },
    { name: 'Ritu Mehta', email: 'ritu@example.com', password: customerHash, role: 'customer', isEmailVerified: true, isActive: true },
    { name: 'Lakshmi Iyer', email: 'lakshmi@example.com', password: customerHash, role: 'customer', isEmailVerified: true, isActive: true },
  ]);
  console.log('Users created');

  // ── Categories ─────────────────────────────────────────────────────────────
  const catData = [
    { name: 'Sarees', description: 'Premium Indian sarees from across the country', sortOrder: 1 },
    { name: 'Silk Sarees', description: 'Handwoven silk sarees in Kanjeevaram, Banarasi and more', sortOrder: 2 },
    { name: 'Cotton Sarees', description: 'Lightweight and breathable cotton sarees', sortOrder: 3 },
    { name: 'Designer Sarees', description: 'Contemporary designer sarees for special occasions', sortOrder: 4 },
    { name: 'Kurtis', description: 'Versatile kurtis for every occasion', sortOrder: 5 },
    { name: 'Kurta Sets', description: 'Matching kurta and bottom sets', sortOrder: 6 },
    { name: 'Lehengas', description: 'Bridal and festive lehengas', sortOrder: 7 },
    { name: 'Salwar Suits', description: 'Classic and contemporary salwar suits', sortOrder: 8 },
    { name: 'Tops', description: 'Trendy tops for casual and formal wear', sortOrder: 9 },
    { name: 'Dresses', description: 'Western dresses for all occasions', sortOrder: 10 },
    { name: 'Jeans & Trousers', description: 'Modern western bottoms', sortOrder: 11 },
    { name: 'Co-Ord Sets', description: 'Matching top and bottom co-ordinate sets', sortOrder: 12 },
    { name: 'Winter Wear', description: 'Stay warm in style', sortOrder: 13 },
    { name: 'Active Wear', description: 'Comfortable activewear for fitness', sortOrder: 14 },
    { name: 'Plus Size', description: 'Fashion for every body type', sortOrder: 15 },
    { name: 'Night Wear', description: 'Comfortable nightwear and loungewear', sortOrder: 16 },
  ];

  const categories = await Category.insertMany(
    catData.map((c) => ({ ...c, slug: slug(c.name), isActive: true }))
  );
  const catMap = Object.fromEntries(categories.map((c) => [c.name, c._id]));
  console.log('Categories created');

  // ── Collections ────────────────────────────────────────────────────────────
  const collData = [
    { name: 'Wedding Collection', description: 'Exquisite pieces for your wedding and special occasions', isFeatured: true, sortOrder: 1 },
    { name: 'Festive Collection', description: 'Celebrate every festival in style', isFeatured: true, sortOrder: 2 },
    { name: 'New Arrivals', description: 'Fresh additions to our catalogue', isFeatured: true, sortOrder: 3 },
    { name: 'Summer Essentials', description: 'Light, breezy and stylish summer picks', isFeatured: false, sortOrder: 4 },
    { name: 'Navratri Special', description: 'Vibrant chaniya cholis and festive wear', isFeatured: true, sortOrder: 5 },
    { name: 'Diwali Collection', description: 'Shimmer and shine this Diwali season', isFeatured: true, sortOrder: 6 },
    { name: 'Office Wear', description: 'Professional and elegant office attire', isFeatured: false, sortOrder: 7 },
    { name: 'Bridal Trousseau', description: 'Complete bridal wardrobe essentials', isFeatured: true, sortOrder: 8 },
  ];

  const collections = await Collection.insertMany(
    collData.map((c) => ({ ...c, slug: slug(c.name), isActive: true }))
  );
  const colMap = Object.fromEntries(collections.map((c) => [c.name, c._id]));
  console.log('Collections created');

  // ── Products ───────────────────────────────────────────────────────────────
  const productData = [
    // ── SILK SAREES ──────────────────────────────────────────────────────────
    {
      name: 'Kanjeevaram Pure Silk Saree - Crimson Gold',
      shortDescription: 'Authentic Kanjeevaram silk with temple border and rich zari work',
      description: 'Experience the timeless beauty of our authentic Kanjeevaram Pure Silk Saree. Handwoven by master weavers in Kanchipuram, this saree features a rich crimson body adorned with intricate temple borders and heavy gold zari work. The saree comes with a matching blouse piece. Perfect for weddings, festivals, and grand occasions.',
      category: catMap['Silk Sarees'],
      collections: [colMap['Wedding Collection'], colMap['Bridal Trousseau']],
      mrp: 18999, salePrice: 14999,
      images: productImages.saree1,
      tags: ['silk', 'kanjeevaram', 'wedding', 'bridal', 'zari', 'temple border', 'kanchipuram'],
      isFeatured: true, isNewArrival: false, isBestSeller: true, isTrending: true, isActive: true,
      variants: [
        { sku: 'AVY-KSS-001-RED', color: 'Crimson Red', fabric: 'Pure Silk', pattern: 'Temple Border', stock: 8 },
        { sku: 'AVY-KSS-001-GRN', color: 'Emerald Green', fabric: 'Pure Silk', pattern: 'Temple Border', stock: 5 },
        { sku: 'AVY-KSS-001-BLU', color: 'Royal Blue', fabric: 'Pure Silk', pattern: 'Temple Border', stock: 3 },
      ],
      metaTitle: 'Kanjeevaram Pure Silk Saree | Avyuktha Fashions',
      metaDescription: 'Authentic handwoven Kanjeevaram pure silk saree with temple border and gold zari work.',
    },
    {
      name: 'Banarasi Silk Saree - Ivory Pearl',
      shortDescription: 'Luxurious Banarasi silk with intricate brocade weaving',
      description: 'Our Banarasi Silk Saree in Ivory Pearl is a masterpiece of Indian textile art. Woven in the heartland of Varanasi, this saree features intricate brocade patterns with silver and gold thread work. The sheer elegance and weight of authentic Banarasi silk make it perfect for brides and festive occasions.',
      category: catMap['Silk Sarees'],
      collections: [colMap['Wedding Collection'], colMap['Diwali Collection']],
      mrp: 15999, salePrice: 12499,
      images: productImages.saree2,
      tags: ['banarasi', 'silk', 'brocade', 'wedding', 'ivory', 'varanasi'],
      isFeatured: true, isNewArrival: true, isBestSeller: false, isTrending: true, isActive: true,
      variants: [
        { sku: 'AVY-BSS-001-IVR', color: 'Ivory', fabric: 'Banarasi Silk', pattern: 'Brocade', stock: 10 },
        { sku: 'AVY-BSS-001-PNK', color: 'Blush Pink', fabric: 'Banarasi Silk', pattern: 'Brocade', stock: 7 },
        { sku: 'AVY-BSS-001-PRP', color: 'Deep Purple', fabric: 'Banarasi Silk', pattern: 'Brocade', stock: 4 },
      ],
    },
    {
      name: 'Mysore Silk Saree - Peacock Blue',
      shortDescription: 'Lightweight Mysore silk with subtle peacock motifs',
      description: 'The Mysore Silk Saree combines the grace of traditional Indian weaving with a lightweight feel perfect for daily wear and festive occasions. This Peacock Blue variant features delicate zari border and scattered peacock motifs throughout the body, representing elegance and royalty.',
      category: catMap['Silk Sarees'],
      collections: [colMap['Festive Collection']],
      mrp: 8999, salePrice: 6999,
      images: productImages.saree3,
      tags: ['mysore silk', 'peacock', 'blue', 'festive', 'lightweight'],
      isFeatured: false, isNewArrival: true, isBestSeller: true, isTrending: false, isActive: true,
      variants: [
        { sku: 'AVY-MSS-001-BLU', color: 'Peacock Blue', fabric: 'Mysore Silk', pattern: 'Peacock Motif', stock: 15 },
        { sku: 'AVY-MSS-001-GLD', color: 'Golden Yellow', fabric: 'Mysore Silk', pattern: 'Peacock Motif', stock: 12 },
        { sku: 'AVY-MSS-001-MGT', color: 'Magenta', fabric: 'Mysore Silk', pattern: 'Peacock Motif', stock: 8 },
      ],
    },
    {
      name: 'Chanderi Silk Cotton Saree - Mint Green',
      shortDescription: 'Delicate Chanderi silk-cotton blend with golden bootis',
      description: 'The Chanderi Silk Cotton Saree is a celebration of Madhya Pradesh\'s weaving heritage. This Mint Green saree features tiny golden bootis scattered across the body, with a contrast golden border. The silk-cotton blend gives it a unique texture — light as cotton yet lustrous as silk. Ideal for summer occasions.',
      category: catMap['Sarees'],
      collections: [colMap['Summer Essentials']],
      mrp: 5999, salePrice: 4299,
      images: productImages.saree1,
      tags: ['chanderi', 'silk cotton', 'mint', 'summer', 'bootis', 'madhya pradesh'],
      isFeatured: false, isNewArrival: true, isBestSeller: false, isTrending: true, isActive: true,
      variants: [
        { sku: 'AVY-CHS-001-MNT', color: 'Mint Green', fabric: 'Chanderi Silk Cotton', pattern: 'Golden Bootis', stock: 20 },
        { sku: 'AVY-CHS-001-SKY', color: 'Sky Blue', fabric: 'Chanderi Silk Cotton', pattern: 'Golden Bootis', stock: 18 },
        { sku: 'AVY-CHS-001-PCH', color: 'Peach', fabric: 'Chanderi Silk Cotton', pattern: 'Golden Bootis', stock: 14 },
      ],
    },

    // ── KURTIS ───────────────────────────────────────────────────────────────
    {
      name: 'Embroidered Anarkali Kurti - Dusty Rose',
      shortDescription: 'Floor-length anarkali kurti with intricate embroidery',
      description: 'This stunning Floor-Length Anarkali Kurti in Dusty Rose is a perfect blend of traditional and contemporary design. Featuring intricate thread embroidery on the yoke and hemline, this kurti flows beautifully and makes a bold style statement. Pair it with palazzos or churidar for a complete ethnic look.',
      category: catMap['Kurtis'],
      collections: [colMap['Festive Collection'], colMap['Navratri Special']],
      mrp: 2999, salePrice: 1999,
      images: productImages.kurti1,
      tags: ['anarkali', 'kurti', 'embroidery', 'dusty rose', 'festive', 'floor length'],
      isFeatured: true, isNewArrival: true, isBestSeller: false, isTrending: true, isActive: true,
      variants: [
        { sku: 'AVY-ANK-001-DSR-XS', color: 'Dusty Rose', size: 'XS', fabric: 'Georgette', pattern: 'Embroidered', stock: 10 },
        { sku: 'AVY-ANK-001-DSR-S', color: 'Dusty Rose', size: 'S', fabric: 'Georgette', pattern: 'Embroidered', stock: 15 },
        { sku: 'AVY-ANK-001-DSR-M', color: 'Dusty Rose', size: 'M', fabric: 'Georgette', pattern: 'Embroidered', stock: 20 },
        { sku: 'AVY-ANK-001-DSR-L', color: 'Dusty Rose', size: 'L', fabric: 'Georgette', pattern: 'Embroidered', stock: 18 },
        { sku: 'AVY-ANK-001-DSR-XL', color: 'Dusty Rose', size: 'XL', fabric: 'Georgette', pattern: 'Embroidered', stock: 12 },
        { sku: 'AVY-ANK-001-TRQ-M', color: 'Turquoise', size: 'M', fabric: 'Georgette', pattern: 'Embroidered', stock: 8 },
        { sku: 'AVY-ANK-001-TRQ-L', color: 'Turquoise', size: 'L', fabric: 'Georgette', pattern: 'Embroidered', stock: 6 },
      ],
    },
    {
      name: 'A-Line Cotton Kurti - Indigo Block Print',
      shortDescription: 'Hand block printed cotton kurti with ethnic motifs',
      description: 'Celebrate Indian artisanship with our Hand Block Printed A-Line Cotton Kurti. Each piece is individually printed by skilled artisans using traditional wooden blocks, making every kurti unique. The Indigo-on-White colorway is both timeless and versatile — dress it up with churidar for work or down with jeans for casual days.',
      category: catMap['Kurtis'],
      collections: [colMap['Summer Essentials'], colMap['Office Wear']],
      mrp: 1499, salePrice: 999,
      images: productImages.kurti2,
      tags: ['block print', 'cotton', 'indigo', 'hand crafted', 'a-line', 'casual'],
      isFeatured: false, isNewArrival: false, isBestSeller: true, isTrending: false, isActive: true,
      variants: [
        { sku: 'AVY-ABP-001-IND-XS', color: 'Indigo White', size: 'XS', fabric: 'Cotton', pattern: 'Block Print', stock: 25 },
        { sku: 'AVY-ABP-001-IND-S', color: 'Indigo White', size: 'S', fabric: 'Cotton', pattern: 'Block Print', stock: 30 },
        { sku: 'AVY-ABP-001-IND-M', color: 'Indigo White', size: 'M', fabric: 'Cotton', pattern: 'Block Print', stock: 35 },
        { sku: 'AVY-ABP-001-IND-L', color: 'Indigo White', size: 'L', fabric: 'Cotton', pattern: 'Block Print', stock: 28 },
        { sku: 'AVY-ABP-001-IND-XL', color: 'Indigo White', size: 'XL', fabric: 'Cotton', pattern: 'Block Print', stock: 20 },
        { sku: 'AVY-ABP-001-IND-XXL', color: 'Indigo White', size: 'XXL', fabric: 'Cotton', pattern: 'Block Print', stock: 15 },
      ],
    },
    {
      name: 'Straight Cut Linen Kurti Set - Sage Green',
      shortDescription: 'Premium linen kurti with matching palazzo pants',
      description: 'Our Straight Cut Linen Kurti Set in Sage Green is the ultimate power dressing outfit for the modern Indian woman. The natural linen fabric keeps you cool and comfortable through the day. Features a classic Mandarin collar, quarter sleeves, and subtle thread work at the neckline. Comes with matching wide-leg palazzo pants.',
      category: catMap['Kurta Sets'],
      collections: [colMap['Office Wear'], colMap['New Arrivals']],
      mrp: 3499, salePrice: 2499,
      images: productImages.kurti1,
      tags: ['linen', 'kurti set', 'palazzo', 'sage green', 'office wear', 'straight cut'],
      isFeatured: false, isNewArrival: true, isBestSeller: false, isTrending: true, isActive: true,
      variants: [
        { sku: 'AVY-LKS-001-SGR-S', color: 'Sage Green', size: 'S', fabric: 'Linen', pattern: 'Solid', stock: 12 },
        { sku: 'AVY-LKS-001-SGR-M', color: 'Sage Green', size: 'M', fabric: 'Linen', pattern: 'Solid', stock: 18 },
        { sku: 'AVY-LKS-001-SGR-L', color: 'Sage Green', size: 'L', fabric: 'Linen', pattern: 'Solid', stock: 15 },
        { sku: 'AVY-LKS-001-SGR-XL', color: 'Sage Green', size: 'XL', fabric: 'Linen', pattern: 'Solid', stock: 10 },
        { sku: 'AVY-LKS-001-OFW-M', color: 'Off White', size: 'M', fabric: 'Linen', pattern: 'Solid', stock: 8 },
        { sku: 'AVY-LKS-001-OFW-L', color: 'Off White', size: 'L', fabric: 'Linen', pattern: 'Solid', stock: 7 },
      ],
    },

    // ── LEHENGAS ─────────────────────────────────────────────────────────────
    {
      name: 'Bridal Lehenga - Ruby Red with Heavy Embroidery',
      shortDescription: 'Luxurious bridal lehenga with zardozi and mirror work',
      description: 'Our Bridal Lehenga in Ruby Red is a dream come true for every bride. This three-piece set includes a heavily embroidered lehenga skirt with zardozi, mirror, and thread work, a matching choli with deep back, and a sheer dupatta with embroidered border. The velvet base gives it a rich look that photographs beautifully.',
      category: catMap['Lehengas'],
      collections: [colMap['Wedding Collection'], colMap['Bridal Trousseau']],
      mrp: 45999, salePrice: 35999,
      images: productImages.lehenga1,
      tags: ['bridal lehenga', 'zardozi', 'mirror work', 'wedding', 'velvet', 'ruby red'],
      isFeatured: true, isNewArrival: false, isBestSeller: true, isTrending: true, isActive: true,
      variants: [
        { sku: 'AVY-BRL-001-RUB-XS', color: 'Ruby Red', size: 'XS', fabric: 'Velvet', pattern: 'Zardozi', stock: 3 },
        { sku: 'AVY-BRL-001-RUB-S', color: 'Ruby Red', size: 'S', fabric: 'Velvet', pattern: 'Zardozi', stock: 5 },
        { sku: 'AVY-BRL-001-RUB-M', color: 'Ruby Red', size: 'M', fabric: 'Velvet', pattern: 'Zardozi', stock: 7 },
        { sku: 'AVY-BRL-001-RUB-L', color: 'Ruby Red', size: 'L', fabric: 'Velvet', pattern: 'Zardozi', stock: 4 },
        { sku: 'AVY-BRL-001-MAR-M', color: 'Maroon Gold', size: 'M', fabric: 'Velvet', pattern: 'Zardozi', stock: 3 },
      ],
    },
    {
      name: 'Festive Lehenga Set - Teal with Golden Work',
      shortDescription: 'Georgette lehenga with golden thread embroidery for festive seasons',
      description: 'Our Festive Lehenga Set in Teal is perfect for sangeet ceremonies, mehendi functions, and Navratri. The lightweight georgette fabric is adorned with golden thread embroidery in a floral pattern. Includes a crop top choli and matching dupatta with all-over gota patti work.',
      category: catMap['Lehengas'],
      collections: [colMap['Festive Collection'], colMap['Navratri Special']],
      mrp: 12999, salePrice: 9499,
      images: productImages.lehenga1,
      tags: ['lehenga', 'georgette', 'festive', 'teal', 'golden', 'navratri', 'sangeet'],
      isFeatured: true, isNewArrival: true, isBestSeller: false, isTrending: true, isActive: true,
      variants: [
        { sku: 'AVY-FLS-001-TEL-S', color: 'Teal Gold', size: 'S', fabric: 'Georgette', pattern: 'Thread Embroidery', stock: 10 },
        { sku: 'AVY-FLS-001-TEL-M', color: 'Teal Gold', size: 'M', fabric: 'Georgette', pattern: 'Thread Embroidery', stock: 15 },
        { sku: 'AVY-FLS-001-TEL-L', color: 'Teal Gold', size: 'L', fabric: 'Georgette', pattern: 'Thread Embroidery', stock: 12 },
        { sku: 'AVY-FLS-001-TEL-XL', color: 'Teal Gold', size: 'XL', fabric: 'Georgette', pattern: 'Thread Embroidery', stock: 8 },
      ],
    },

    // ── WESTERN WEAR ─────────────────────────────────────────────────────────
    {
      name: 'Floral Wrap Midi Dress - Terracotta',
      shortDescription: 'Elegant wrap midi dress with floral print and tie waist',
      description: 'The Floral Wrap Midi Dress in Terracotta is a versatile wardrobe essential for the modern woman. The flattering wrap silhouette with adjustable tie waist works for all body types. Features a V-neckline, flowing midi length, and our signature terracotta floral print. Perfect for brunches, dates, and office wear.',
      category: catMap['Dresses'],
      collections: [colMap['Summer Essentials'], colMap['Office Wear']],
      mrp: 3999, salePrice: 2799,
      images: productImages.dress1,
      tags: ['wrap dress', 'midi', 'floral', 'terracotta', 'summer', 'office'],
      isFeatured: false, isNewArrival: true, isBestSeller: false, isTrending: true, isActive: true,
      variants: [
        { sku: 'AVY-WMD-001-TRC-XS', color: 'Terracotta', size: 'XS', fabric: 'Chiffon', pattern: 'Floral', stock: 12 },
        { sku: 'AVY-WMD-001-TRC-S', color: 'Terracotta', size: 'S', fabric: 'Chiffon', pattern: 'Floral', stock: 18 },
        { sku: 'AVY-WMD-001-TRC-M', color: 'Terracotta', size: 'M', fabric: 'Chiffon', pattern: 'Floral', stock: 22 },
        { sku: 'AVY-WMD-001-TRC-L', color: 'Terracotta', size: 'L', fabric: 'Chiffon', pattern: 'Floral', stock: 16 },
        { sku: 'AVY-WMD-001-TRC-XL', color: 'Terracotta', size: 'XL', fabric: 'Chiffon', pattern: 'Floral', stock: 10 },
      ],
    },
    {
      name: 'Linen Co-Ord Set - French Beige',
      shortDescription: 'Minimalist linen blazer and wide-leg trouser co-ord',
      description: 'Elevate your office and casual wardrobe with our Linen Co-Ord Set in French Beige. This two-piece set features a structured blazer with notch lapels and matching wide-leg trousers. The natural linen fabric is breathable and wrinkle-resistant. Can be worn together or styled separately with other pieces.',
      category: catMap['Co-Ord Sets'],
      collections: [colMap['Office Wear'], colMap['New Arrivals']],
      mrp: 5999, salePrice: 4299,
      images: productImages.coord1,
      tags: ['co-ord set', 'linen', 'blazer', 'wide leg', 'office', 'beige', 'minimalist'],
      isFeatured: false, isNewArrival: true, isBestSeller: false, isTrending: true, isActive: true,
      variants: [
        { sku: 'AVY-LCS-001-BEI-XS', color: 'French Beige', size: 'XS', fabric: 'Linen', pattern: 'Solid', stock: 8 },
        { sku: 'AVY-LCS-001-BEI-S', color: 'French Beige', size: 'S', fabric: 'Linen', pattern: 'Solid', stock: 12 },
        { sku: 'AVY-LCS-001-BEI-M', color: 'French Beige', size: 'M', fabric: 'Linen', pattern: 'Solid', stock: 15 },
        { sku: 'AVY-LCS-001-BEI-L', color: 'French Beige', size: 'L', fabric: 'Linen', pattern: 'Solid', stock: 12 },
        { sku: 'AVY-LCS-001-BEI-XL', color: 'French Beige', size: 'XL', fabric: 'Linen', pattern: 'Solid', stock: 8 },
        { sku: 'AVY-LCS-001-BLK-M', color: 'Jet Black', size: 'M', fabric: 'Linen', pattern: 'Solid', stock: 10 },
        { sku: 'AVY-LCS-001-BLK-L', color: 'Jet Black', size: 'L', fabric: 'Linen', pattern: 'Solid', stock: 8 },
      ],
    },
    {
      name: 'Crop Top with High Waist Flared Skirt - Lavender',
      shortDescription: 'Trendy crop top and flared midi skirt co-ord in lavender',
      description: 'Make a statement with our Crop Top and High Waist Flared Skirt Co-Ord Set in Lavender. The sleeveless crop top features a square neckline and is paired with a high-waisted midi-length flared skirt. Both pieces are made from premium polyester satin for a fluid, elegant drape.',
      category: catMap['Co-Ord Sets'],
      collections: [colMap['New Arrivals']],
      mrp: 3499, salePrice: 2299,
      images: productImages.western1,
      tags: ['crop top', 'flared skirt', 'co-ord', 'lavender', 'satin', 'trendy'],
      isFeatured: false, isNewArrival: true, isBestSeller: false, isTrending: true, isActive: true,
      variants: [
        { sku: 'AVY-CFS-001-LAV-XS', color: 'Lavender', size: 'XS', fabric: 'Satin', pattern: 'Solid', stock: 10 },
        { sku: 'AVY-CFS-001-LAV-S', color: 'Lavender', size: 'S', fabric: 'Satin', pattern: 'Solid', stock: 15 },
        { sku: 'AVY-CFS-001-LAV-M', color: 'Lavender', size: 'M', fabric: 'Satin', pattern: 'Solid', stock: 18 },
        { sku: 'AVY-CFS-001-LAV-L', color: 'Lavender', size: 'L', fabric: 'Satin', pattern: 'Solid', stock: 14 },
      ],
    },
    {
      name: 'Palazzo Set with Printed Top - Geometric Print',
      shortDescription: 'Vibrant geometric print top with wide-leg palazzo pants',
      description: 'Our Palazzo Set features a vibrant geometric print on a crepe top paired with matching wide-leg palazzo pants. The loose, comfortable silhouette is perfect for both casual and semi-formal occasions. The bold geometric print in warm tones is eye-catching and fashion-forward.',
      category: catMap['Kurta Sets'],
      collections: [colMap['Festive Collection']],
      mrp: 2799, salePrice: 1799,
      images: productImages.western2,
      tags: ['palazzo', 'geometric print', 'set', 'crepe', 'comfortable', 'festive'],
      isFeatured: false, isNewArrival: false, isBestSeller: true, isTrending: false, isActive: true,
      variants: [
        { sku: 'AVY-PLS-001-GEO-S', color: 'Multi', size: 'S', fabric: 'Crepe', pattern: 'Geometric', stock: 20 },
        { sku: 'AVY-PLS-001-GEO-M', color: 'Multi', size: 'M', fabric: 'Crepe', pattern: 'Geometric', stock: 25 },
        { sku: 'AVY-PLS-001-GEO-L', color: 'Multi', size: 'L', fabric: 'Crepe', pattern: 'Geometric', stock: 22 },
        { sku: 'AVY-PLS-001-GEO-XL', color: 'Multi', size: 'XL', fabric: 'Crepe', pattern: 'Geometric', stock: 15 },
      ],
    },

    // ── SALWAR SUITS ─────────────────────────────────────────────────────────
    {
      name: 'Patiala Salwar Suit - Mustard Phulkari',
      shortDescription: 'Vibrant phulkari embroidered patiala suit set',
      description: 'Celebrate Punjabi heritage with our Patiala Salwar Suit in Mustard with authentic Phulkari embroidery. The comfortable patiala pants are paired with a straight cut kameez featuring phulkari work on the neckline and hemline. Includes a matching chiffon dupatta. Perfect for Lohri, Baisakhi, and festive celebrations.',
      category: catMap['Salwar Suits'],
      collections: [colMap['Festive Collection']],
      mrp: 3999, salePrice: 2799,
      images: productImages.kurti2,
      tags: ['patiala', 'phulkari', 'punjabi', 'mustard', 'embroidery', 'salwar suit'],
      isFeatured: false, isNewArrival: false, isBestSeller: true, isTrending: false, isActive: true,
      variants: [
        { sku: 'AVY-PSS-001-MUS-S', color: 'Mustard', size: 'S', fabric: 'Cotton', pattern: 'Phulkari', stock: 15 },
        { sku: 'AVY-PSS-001-MUS-M', color: 'Mustard', size: 'M', fabric: 'Cotton', pattern: 'Phulkari', stock: 20 },
        { sku: 'AVY-PSS-001-MUS-L', color: 'Mustard', size: 'L', fabric: 'Cotton', pattern: 'Phulkari', stock: 18 },
        { sku: 'AVY-PSS-001-MUS-XL', color: 'Mustard', size: 'XL', fabric: 'Cotton', pattern: 'Phulkari', stock: 12 },
      ],
    },
    {
      name: 'Sharara Set - Bottle Green Sequin',
      shortDescription: 'Statement sharara set with heavy sequin embellishments',
      description: 'Make every entrance count with our Bottle Green Sharara Set adorned with heavy sequin embellishments. This three-piece set includes a short embroidered kameez, flared sharara pants with sequin detailing, and a matching net dupatta with sequin border. Perfect for sangeet nights and festive parties.',
      category: catMap['Salwar Suits'],
      collections: [colMap['Wedding Collection'], colMap['Diwali Collection']],
      mrp: 8999, salePrice: 6499,
      images: productImages.lehenga1,
      tags: ['sharara', 'sequin', 'bottle green', 'festive', 'wedding', 'party wear'],
      isFeatured: true, isNewArrival: false, isBestSeller: false, isTrending: true, isActive: true,
      variants: [
        { sku: 'AVY-SHR-001-BGR-XS', color: 'Bottle Green', size: 'XS', fabric: 'Net', pattern: 'Sequin', stock: 5 },
        { sku: 'AVY-SHR-001-BGR-S', color: 'Bottle Green', size: 'S', fabric: 'Net', pattern: 'Sequin', stock: 8 },
        { sku: 'AVY-SHR-001-BGR-M', color: 'Bottle Green', size: 'M', fabric: 'Net', pattern: 'Sequin', stock: 10 },
        { sku: 'AVY-SHR-001-BGR-L', color: 'Bottle Green', size: 'L', fabric: 'Net', pattern: 'Sequin', stock: 7 },
      ],
    },

    // ── DESIGNER SAREES ──────────────────────────────────────────────────────
    {
      name: 'Designer Drape Saree - Midnight Navy Sequin',
      shortDescription: 'Pre-stitched designer drape saree with sequin work',
      description: 'Revolutionize your saree experience with our Pre-Stitched Designer Drape Saree in Midnight Navy. No draping expertise required — simply step in and zip up. Features a heavily embellished sequin yoke that doubles as a blouse, with a flowing georgette drape. The perfect fusion of tradition and convenience.',
      category: catMap['Designer Sarees'],
      collections: [colMap['New Arrivals'], colMap['Diwali Collection']],
      mrp: 9999, salePrice: 7499,
      images: productImages.saree2,
      tags: ['designer', 'pre-stitched', 'sequin', 'navy', 'drape saree', 'fusion'],
      isFeatured: true, isNewArrival: true, isBestSeller: false, isTrending: true, isActive: true,
      variants: [
        { sku: 'AVY-DDS-001-NVY-S', color: 'Midnight Navy', size: 'S', fabric: 'Georgette', pattern: 'Sequin', stock: 8 },
        { sku: 'AVY-DDS-001-NVY-M', color: 'Midnight Navy', size: 'M', fabric: 'Georgette', pattern: 'Sequin', stock: 12 },
        { sku: 'AVY-DDS-001-NVY-L', color: 'Midnight Navy', size: 'L', fabric: 'Georgette', pattern: 'Sequin', stock: 10 },
        { sku: 'AVY-DDS-001-WNG-M', color: 'Wine Gold', size: 'M', fabric: 'Georgette', pattern: 'Sequin', stock: 6 },
      ],
    },
    {
      name: 'Linen Cotton Saree - Natural Beige Handloom',
      shortDescription: 'Handloom linen cotton saree with minimalist stripe border',
      description: 'Embrace the beauty of simplicity with our Handloom Linen Cotton Saree in Natural Beige. Woven on traditional handlooms, each saree has a slightly unique texture that is the hallmark of handmade craftsmanship. Features a subtle stripe border in brown and comes with an unstitched blouse piece. Ideal for daily wear and office outings.',
      category: catMap['Cotton Sarees'],
      collections: [colMap['Office Wear'], colMap['Summer Essentials']],
      mrp: 4999, salePrice: 3499,
      images: productImages.saree3,
      tags: ['linen cotton', 'handloom', 'natural', 'beige', 'minimal', 'office', 'daily wear'],
      isFeatured: false, isNewArrival: false, isBestSeller: true, isTrending: false, isActive: true,
      variants: [
        { sku: 'AVY-LCS-002-NAT', color: 'Natural Beige', fabric: 'Linen Cotton', pattern: 'Stripe Border', stock: 30 },
        { sku: 'AVY-LCS-002-GRY', color: 'Slate Grey', fabric: 'Linen Cotton', pattern: 'Stripe Border', stock: 25 },
        { sku: 'AVY-LCS-002-WHT', color: 'White', fabric: 'Linen Cotton', pattern: 'Stripe Border', stock: 20 },
      ],
    },
  ];

  const products = await Product.insertMany(
    productData.map((p) => ({
      ...p,
      slug: slug(p.name),
      ratings: { average: 0, count: 0 },
    }))
  );
  console.log(`${products.length} Products created`);

  // ── Reviews ────────────────────────────────────────────────────────────────
  const reviewData = [
    { product: products[0]._id, user: customers[0]._id, order: new mongoose.Types.ObjectId(), rating: 5, title: 'Absolutely Stunning!', body: 'The Kanjeevaram saree exceeded all my expectations. The zari work is incredibly detailed and the colour is exactly as shown. Wore it for my cousin\'s wedding and received so many compliments!', isVerifiedPurchase: true, isApproved: true },
    { product: products[0]._id, user: customers[1]._id, order: new mongoose.Types.ObjectId(), rating: 4, title: 'Beautiful quality, slightly heavy', body: 'Genuine Kanjeevaram silk, you can tell from the texture and weight. The border work is spectacular. Only giving 4 stars because it\'s quite heavy to wear for long hours.', isVerifiedPurchase: true, isApproved: true },
    { product: products[1]._id, user: customers[2]._id, order: new mongoose.Types.ObjectId(), rating: 5, title: 'Perfect for our wedding!', body: 'Bought this Banarasi saree for my daughter\'s wedding. The brocade work is exquisite and the ivory colour photographs beautifully. Avyuktha packaging is also premium — came in a beautiful box!', isVerifiedPurchase: true, isApproved: true },
    { product: products[4]._id, user: customers[3]._id, order: new mongoose.Types.ObjectId(), rating: 5, title: 'Love this anarkali!', body: 'The Anarkali kurti in dusty rose is gorgeous. The embroidery is detailed and the georgette fabric has a beautiful drape. Sizing is accurate — I ordered M and it fits perfectly.', isVerifiedPurchase: true, isApproved: true },
    { product: products[4]._id, user: customers[4]._id, order: new mongoose.Types.ObjectId(), rating: 4, title: 'Great for Navratri!', body: 'Wore this for Navratri and got tons of compliments. The colour is vibrant and the embroidery is beautiful. Delivery was super fast too!', isVerifiedPurchase: false, isApproved: true },
    { product: products[7]._id, user: customers[0]._id, order: new mongoose.Types.ObjectId(), rating: 5, title: 'A dream bridal lehenga', body: 'This is THE lehenga every bride dreams of. The zardozi work is heavy and intricate, the colour is a deep ruby that glows in photos. Worth every rupee! The packaging was incredible too.', isVerifiedPurchase: true, isApproved: true },
    { product: products[10]._id, user: customers[5]._id, order: new mongoose.Types.ObjectId(), rating: 5, title: 'So comfortable and chic!', body: 'The floral wrap dress is exactly what I needed for summer. Light, breezy, and the terracotta print is stunning. Wore it to a brunch and everyone asked where I got it from!', isVerifiedPurchase: true, isApproved: true },
    { product: products[11]._id, user: customers[6]._id, order: new mongoose.Types.ObjectId(), rating: 4, title: 'Very professional look', body: 'The linen co-ord set in beige is perfect for office. Quality of linen is excellent and the cut is flattering. The blazer is slightly boxy but that\'s the style so 4 stars.', isVerifiedPurchase: true, isApproved: true },
  ];

  const insertedReviews = await Review.insertMany(reviewData);

  // Update product ratings
  for (const product of products) {
    const productReviews = insertedReviews.filter((r) => r.product.toString() === product._id.toString() && r.isApproved);
    if (productReviews.length > 0) {
      const avg = productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length;
      await Product.findByIdAndUpdate(product._id, {
        'ratings.average': Math.round(avg * 10) / 10,
        'ratings.count': productReviews.length,
      });
    }
  }
  console.log('Reviews created + ratings updated');

  // ── Coupons ────────────────────────────────────────────────────────────────
  const now = new Date();
  const futureDate = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  const nearFuture = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await Coupon.insertMany([
    { code: 'WELCOME10', type: 'percentage', value: 10, minOrderValue: 999, maxDiscount: 500, usageLimit: 1000, perUserLimit: 1, startDate: now, expiryDate: futureDate, isActive: true, description: '10% off on your first order' },
    { code: 'FLAT500', type: 'flat', value: 500, minOrderValue: 2999, usageLimit: 500, perUserLimit: 2, startDate: now, expiryDate: futureDate, isActive: true, description: 'Flat ₹500 off on orders above ₹2999' },
    { code: 'FREESHIP', type: 'free_shipping', value: 0, minOrderValue: 499, usageLimit: 2000, perUserLimit: 5, startDate: now, expiryDate: futureDate, isActive: true, description: 'Free shipping on all orders above ₹499' },
    { code: 'NEWBRIDE20', type: 'percentage', value: 20, minOrderValue: 10000, maxDiscount: 3000, usageLimit: 200, perUserLimit: 1, startDate: now, expiryDate: futureDate, isActive: true, description: '20% off bridal collection' },
    { code: 'DIWALI15', type: 'festival', value: 15, minOrderValue: 1999, maxDiscount: 1500, usageLimit: 1000, perUserLimit: 2, startDate: now, expiryDate: nearFuture, isActive: true, description: 'Diwali special — 15% off' },
    { code: 'FIRSTORDER', type: 'first_order', value: 12, minOrderValue: 799, maxDiscount: 400, usageLimit: 5000, perUserLimit: 1, startDate: now, expiryDate: futureDate, isActive: true, description: 'First order discount — 12% off' },
    { code: 'SUMMER25', type: 'percentage', value: 25, minOrderValue: 1499, maxDiscount: 800, usageLimit: 300, perUserLimit: 1, startDate: now, expiryDate: nearFuture, isActive: true, description: 'Summer sale — 25% off' },
  ]);
  console.log('Coupons created');

  // ── Orders ─────────────────────────────────────────────────────────────────
  const mkAddress = (user: typeof customers[0]) => ({
    label: 'Home',
    fullName: user.name,
    phone: (user.phone as string | undefined) || '9876543210',
    line1: '123 Fashion Street',
    line2: 'Near Central Mall',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500001',
    country: 'India',
  });

  const orderData = [
    // Customer 1 — delivered
    {
      user: customers[0]._id,
      items: [
        { product: products[0]._id, variant: products[0].variants[0], quantity: 1, price: products[0].salePrice },
      ],
      shippingAddress: mkAddress(customers[0]),
      subtotal: products[0].salePrice,
      shippingCharge: 0,
      discount: 0,
      total: products[0].salePrice,
      paymentMethod: 'razorpay',
      paymentStatus: 'paid',
      status: 'delivered',
      razorpayOrderId: 'order_test_001',
      razorpayPaymentId: 'pay_test_001',
      shiprocketOrderId: 'SR_001',
      awbCode: '1234567890',
    },
    // Customer 1 — shipped
    {
      user: customers[0]._id,
      items: [
        { product: products[4]._id, variant: products[4].variants[0], quantity: 2, price: products[4].salePrice },
      ],
      shippingAddress: mkAddress(customers[0]),
      subtotal: products[4].salePrice * 2,
      shippingCharge: 0,
      discount: 200,
      total: products[4].salePrice * 2 - 200,
      paymentMethod: 'upi',
      paymentStatus: 'paid',
      status: 'shipped',
      awbCode: '9876543210',
    },
    // Customer 2 — confirmed
    {
      user: customers[1]._id,
      items: [
        { product: products[1]._id, variant: products[1].variants[0], quantity: 1, price: products[1].salePrice },
        { product: products[7]._id, variant: products[7].variants[0], quantity: 1, price: products[7].salePrice },
      ],
      shippingAddress: mkAddress(customers[1]),
      subtotal: products[1].salePrice + products[7].salePrice,
      shippingCharge: 0,
      discount: 0,
      total: products[1].salePrice + products[7].salePrice,
      paymentMethod: 'card',
      paymentStatus: 'paid',
      status: 'confirmed',
    },
    // Customer 3 — pending COD
    {
      user: customers[2]._id,
      items: [
        { product: products[5]._id, variant: products[5].variants[1] || products[5].variants[0], quantity: 1, price: products[5].salePrice },
      ],
      shippingAddress: mkAddress(customers[2]),
      subtotal: products[5].salePrice,
      shippingCharge: 99,
      discount: 0,
      total: products[5].salePrice + 99,
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      status: 'pending',
    },
    // Customer 4 — delivered
    {
      user: customers[3]._id,
      items: [
        { product: products[9]._id, variant: products[9].variants[0], quantity: 1, price: products[9].salePrice },
        { product: products[10]._id, variant: products[10].variants[0], quantity: 1, price: products[10].salePrice },
      ],
      shippingAddress: mkAddress(customers[3]),
      subtotal: products[9].salePrice + products[10].salePrice,
      shippingCharge: 0,
      discount: 300,
      total: products[9].salePrice + products[10].salePrice - 300,
      paymentMethod: 'razorpay',
      paymentStatus: 'paid',
      status: 'delivered',
    },
    // Customer 5 — cancelled
    {
      user: customers[4]._id,
      items: [
        { product: products[8]._id, variant: products[8].variants[0], quantity: 1, price: products[8].salePrice },
      ],
      shippingAddress: mkAddress(customers[4]),
      subtotal: products[8].salePrice,
      shippingCharge: 0,
      discount: 0,
      total: products[8].salePrice,
      paymentMethod: 'razorpay',
      paymentStatus: 'refunded',
      status: 'cancelled',
      cancelReason: 'Changed mind',
    },
    // Customer 2 — packed
    {
      user: customers[1]._id,
      items: [
        { product: products[11]._id, variant: products[11].variants[0], quantity: 1, price: products[11].salePrice },
        { product: products[12]._id, variant: products[12].variants[0], quantity: 2, price: products[12].salePrice },
      ],
      shippingAddress: mkAddress(customers[1]),
      subtotal: products[11].salePrice + products[12].salePrice * 2,
      shippingCharge: 0,
      discount: 0,
      total: products[11].salePrice + products[12].salePrice * 2,
      paymentMethod: 'netbanking',
      paymentStatus: 'paid',
      status: 'packed',
    },
    // Customer 3 — delivered (older)
    {
      user: customers[2]._id,
      items: [
        { product: products[2]._id, variant: products[2].variants[0], quantity: 1, price: products[2].salePrice },
      ],
      shippingAddress: mkAddress(customers[2]),
      subtotal: products[2].salePrice,
      shippingCharge: 0,
      discount: 0,
      total: products[2].salePrice,
      paymentMethod: 'upi',
      paymentStatus: 'paid',
      status: 'delivered',
    },
  ];

  const orders = await Order.insertMany(
    orderData.map((o, i) => ({
      ...o,
      orderId: `AVY-${Date.now() - (orderData.length - i) * 86400000}-${String(i + 1).padStart(4, '0')}`,
    }))
  );
  console.log(`${orders.length} Orders created`);

  // ── Announcements ──────────────────────────────────────────────────────────
  await Announcement.insertMany([
    { title: 'Free Shipping', content: '🎉 Free Shipping on orders above ₹999 | Use code FREESHIP', type: 'top_bar', startDate: now, expiryDate: futureDate, isActive: true, bgColor: '#C8A97E', textColor: '#FFFFFF', ctaText: 'Shop Now', ctaLink: '/products' },
    { title: 'Welcome Popup', content: 'Welcome to Avyuktha Fashions! Get 10% off your first order with code WELCOME10', type: 'popup', ctaText: 'Shop Now', ctaLink: '/products', startDate: now, expiryDate: futureDate, isActive: true, bgColor: '#1C1C1C', textColor: '#FFFFFF' },
    { title: 'Diwali Sale', content: '✨ Diwali Special — Up to 25% off on ethnic wear! Limited time only', type: 'flash_sale', startDate: now, expiryDate: nearFuture, isActive: true, bgColor: '#D8A7B1', textColor: '#1C1C1C', ctaText: 'Grab Now', ctaLink: '/products?collection=festive' },
    { title: 'New Wedding Collection', content: 'NEW: Bridal Trousseau Collection is here. Explore exquisite sarees, lehengas and sets', type: 'promotional_banner', startDate: now, expiryDate: futureDate, isActive: true, ctaText: 'Explore Collection', ctaLink: '/products?collection=wedding' },
    { title: 'Navratri Festival', content: '🎊 Navratri Special Collection — Chaniya Cholis, Lehengas and more!', type: 'festival', startDate: now, expiryDate: nearFuture, isActive: true, bgColor: '#F5EFE8', textColor: '#1C1C1C', ctaText: 'Shop Navratri', ctaLink: '/products?collection=navratri-special' },
  ]);
  console.log('Announcements created');

  // ── Blogs ──────────────────────────────────────────────────────────────────
  await Blog.insertMany([
    {
      title: 'How to Style a Kanjeevaram Saree for Modern Occasions',
      slug: 'how-to-style-kanjeevaram-saree-modern-occasions',
      excerpt: 'The Kanjeevaram saree has been a bridal staple for centuries. But did you know you can style it for contemporary settings too? Here\'s your complete guide.',
      content: `<h2>The Timeless Kanjeevaram</h2><p>The Kanjeevaram saree, woven in the temple town of Kanchipuram in Tamil Nadu, is one of India's most prized silk traditions. Known for its heavy weight, rich zari work, and vivid colors, it has adorned brides across generations.</p><h2>Modern Styling Tips</h2><p>Here are 5 ways to style your Kanjeevaram for modern occasions:</p><ul><li><strong>Belt it up:</strong> Add a wide leather or fabric belt to create a defined waist</li><li><strong>The dhoti drape:</strong> Try a dhoti-style drape instead of the traditional nivi drape</li><li><strong>Cape blouse:</strong> Pair with a contemporary cape blouse for a fusion look</li><li><strong>Pre-stitched convenience:</strong> Opt for a pre-stitched Kanjeevaram for events</li><li><strong>Minimalist jewelry:</strong> Let the saree speak — choose minimal gold earrings</li></ul><p>The key is to honor the saree's heritage while adding your personal modern touch.</p>`,
      coverImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&q=80',
      author: contentEditor._id,
      category: 'Style Guide',
      tags: ['kanjeevaram', 'saree styling', 'bridal', 'silk', 'fashion tips'],
      isPublished: true,
      publishedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Top 10 Festive Outfit Ideas for Diwali 2025',
      slug: 'top-10-festive-outfit-ideas-diwali-2025',
      excerpt: 'Diwali is around the corner and you want to look your absolute best. We\'ve curated 10 stunning outfit ideas ranging from traditional to contemporary.',
      content: `<h2>Diwali Fashion 2025</h2><p>The festival of lights calls for your most radiant outfits. Whether you're attending a puja, hosting a party, or visiting family, here are 10 outfit ideas to inspire you.</p><h3>1. The Classic Silk Saree</h3><p>Nothing beats a rich silk saree in jewel tones — emerald, ruby, or sapphire.</p><h3>2. Embellished Anarkali</h3><p>A floor-length anarkali with mirror work captures the Diwali spirit beautifully.</p><h3>3. Dhoti Pants with Embroidered Top</h3><p>For the contemporary woman — pair wide dhoti pants with a heavily embroidered crop top.</p><h3>4. Sharara Set</h3><p>A sharara set in golden or copper tones will make you the star of any Diwali party.</p><h3>5. Banarasi Lehenga</h3><p>Go all-out bridal with a Banarasi lehenga — because Diwali deserves grand gestures.</p>`,
      coverImage: 'https://images.unsplash.com/photo-1583391733956-6c78276477e1?w=1200&q=80',
      author: contentEditor._id,
      category: 'Festival Fashion',
      tags: ['diwali', 'festive wear', 'ethnic fashion', 'outfit ideas', '2025'],
      isPublished: true,
      publishedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'A Guide to Indian Handloom Fabrics Every Woman Should Know',
      slug: 'guide-to-indian-handloom-fabrics',
      excerpt: 'India has one of the richest handloom traditions in the world. From Mysore silk to Chanderi, here\'s your definitive guide to the fabrics that define Indian fashion.',
      content: `<h2>India's Handloom Heritage</h2><p>India's handloom industry is the world's largest, employing millions of artisans and producing fabrics of unparalleled beauty. Understanding these fabrics helps you make more informed choices — and appreciate the art behind what you wear.</p><h2>Key Handloom Fabrics</h2><h3>Kanjeevaram Silk</h3><p>From Tamil Nadu — known for heavy weight, rich zari borders, and vibrant colors. A wedding staple.</p><h3>Banarasi Silk</h3><p>From Varanasi — features intricate brocade patterns with gold and silver thread work.</p><h3>Chanderi</h3><p>From Madhya Pradesh — lightweight silk-cotton blend with sheer texture and golden bootis.</p><h3>Mysore Silk</h3><p>From Karnataka — known for pure silk with characteristic creamy texture and subtle sheen.</p><h3>Ikkat / Ikat</h3><p>Traditional tie-dye technique creating unique blurred patterns. Found in Gujarat, Odisha, and Andhra Pradesh.</p>`,
      coverImage: 'https://images.unsplash.com/photo-1614093302611-8efc4c438a87?w=1200&q=80',
      author: contentEditor._id,
      category: 'Fashion Education',
      tags: ['handloom', 'indian textiles', 'silk', 'fabric guide', 'artisan'],
      isPublished: true,
      publishedAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Building Your Capsule Ethnic Wardrobe',
      slug: 'building-capsule-ethnic-wardrobe',
      excerpt: 'Less is more — even in ethnic wear. Learn how to build a versatile ethnic capsule wardrobe that takes you from office to wedding with just 10 key pieces.',
      content: `<h2>The Capsule Ethnic Wardrobe</h2><p>The concept of a capsule wardrobe — a small collection of essential, versatile pieces — applies beautifully to ethnic wear. Instead of buying many pieces that you rarely wear, invest in 10 high-quality items that work together seamlessly.</p><h2>Your 10 Essential Pieces</h2><ol><li>One silk saree in a jewel tone (for weddings and grand occasions)</li><li>One cotton handloom saree (for daily wear and office)</li><li>Two A-line kurtis in neutral tones (beige, white, navy)</li><li>One kurta set in a statement print</li><li>One anarkali kurti for festive occasions</li><li>One palazzo set for comfort and style</li><li>One salwar suit for family occasions</li><li>One lehenga skirt that can be paired with different tops</li><li>One fusion piece — a dhoti pant or pre-stitched drape saree</li><li>Quality accessories — one set of gold earrings and a statement clutch</li></ol>`,
      coverImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200&q=80',
      author: contentEditor._id,
      category: 'Style Guide',
      tags: ['capsule wardrobe', 'ethnic wear', 'style tips', 'minimalist fashion'],
      isPublished: true,
      publishedAt: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'The Art of Draping: 5 Creative Saree Styles',
      slug: 'art-of-draping-5-creative-saree-styles',
      excerpt: 'Beyond the classic Nivi drape, there are dozens of ways to wear a saree. Here are 5 creative draping styles to transform your saree game.',
      content: `<h2>Beyond the Nivi Drape</h2><p>Most of us grew up seeing sarees draped in the classic Nivi style from Andhra Pradesh. But India has over 100 documented saree draping styles — each region with its own unique tradition. Here are 5 styles to explore:</p><h3>1. Bengali Style (Atpoure)</h3><p>Pleats in the front, the pallu draped diagonally from right to left over the shoulder.</p><h3>2. Gujarati Style</h3><p>The pallu is brought to the front over the right shoulder — perfect for showing off embroidery work.</p><h3>3. Maharashtrian Nauvari</h3><p>The 9-yard saree is worn like a dhoti — bold and practical.</p><h3>4. Mumtaz Style</h3><p>Inspired by Bollywood — tightly wrapped to show the figure, the pallu pinned at the shoulder.</p><h3>5. Dhoti Drape (Modern Fusion)</h3><p>The saree is draped like dhoti pants — a contemporary fusion style popular at fashion events.</p>`,
      coverImage: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=1200&q=80',
      author: contentEditor._id,
      category: 'How-To',
      tags: ['saree draping', 'fashion tips', 'style guide', 'indian fashion'],
      isPublished: true,
      publishedAt: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Wedding Guest Outfit Guide: What to Wear at Indian Weddings',
      slug: 'wedding-guest-outfit-guide-indian-weddings',
      excerpt: 'Indian weddings are multi-day extravaganzas with different dress codes for each function. Here\'s your complete guide to dressing as a wedding guest.',
      content: `<h2>The Indian Wedding Guest</h2><p>Being a wedding guest in India is a full-time styling job. With mehendi, sangeet, haldi, wedding ceremony, and reception, you need at least 3-5 different outfits. Here's how to nail each function:</p><h3>Mehendi</h3><p>Go with light, colourful fabrics — printed cotton or chiffon sarees, kurtis in bright hues. Avoid whites and dark colours.</p><h3>Sangeet</h3><p>This is the party night — lehengas, sharara sets, or embellished sarees in vibrant colours are perfect.</p><h3>Haldi</h3><p>Yellow is traditional — a light cotton kurti or simple saree. You might get turmeric on it, so keep it casual.</p><h3>Wedding Ceremony</h3><p>Pull out your best silk saree or heavy lehenga. This is the most photographed event — dress accordingly.</p><h3>Reception</h3><p>A step below the wedding in formality. A designer saree, embellished anarkali, or indo-western ensemble works well.</p>`,
      coverImage: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200&q=80',
      author: contentEditor._id,
      category: 'Wedding Fashion',
      tags: ['wedding guest', 'indian wedding', 'outfit guide', 'mehendi', 'sangeet'],
      isPublished: true,
      publishedAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
    },
  ]);
  console.log('Blogs created');

  // ── Newsletter ─────────────────────────────────────────────────────────────
  await Newsletter.insertMany([
    { email: 'newsletter1@example.com', isSubscribed: true, source: 'website' },
    { email: 'newsletter2@example.com', isSubscribed: true, source: 'website' },
    { email: 'newsletter3@example.com', isSubscribed: true, source: 'popup' },
    { email: 'newsletter4@example.com', isSubscribed: true, source: 'popup' },
    { email: 'newsletter5@example.com', isSubscribed: true, source: 'website' },
    { email: 'priya@example.com', isSubscribed: true, source: 'website' },
    { email: 'anitha@example.com', isSubscribed: true, source: 'popup' },
    { email: 'meena@example.com', isSubscribed: false, source: 'website' },
    { email: 'kavya@example.com', isSubscribed: true, source: 'website' },
    { email: 'sneha@example.com', isSubscribed: true, source: 'popup' },
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
          { title: 'Bridal\nSplendour', subtitle: 'Handcrafted silk sarees for your special day', label: 'Wedding Collection', ctaLabel: 'Explore', ctaHref: '/products?search=silk sarees' },
          { title: 'Celebrate\nin Style', subtitle: 'Kurtis, lehengas and sets for every occasion', label: 'Festive Season', ctaLabel: 'Shop Festive', ctaHref: '/products?collection=festive-collection' },
        ],
      },
      lastUpdatedBy: superAdmin._id,
    },
    {
      key: 'about',
      title: 'About Us',
      content: {
        heading: 'Our Story',
        body: 'Born from a deep love for Indian textiles and craftsmanship, Avyuktha Fashions bridges the timeless beauty of traditional weaves with contemporary silhouettes.',
        stats: [{ label: 'Products', value: '5000+' }, { label: 'Happy Customers', value: '50K+' }, { label: 'Years', value: '12+' }],
      },
      lastUpdatedBy: superAdmin._id,
    },
    {
      key: 'privacy',
      title: 'Privacy Policy',
      content: `<h2>Privacy Policy</h2><p>At Avyuktha Fashions, we are committed to protecting your privacy. This Privacy Policy describes how we collect, use, and protect your personal information.</p><h3>Information We Collect</h3><p>We collect information you provide directly, such as your name, email address, phone number, and shipping address when you create an account or place an order.</p><h3>How We Use Your Information</h3><p>We use your information to process orders, send shipping updates, and occasionally send promotional emails (which you can unsubscribe from at any time).</p><h3>Data Security</h3><p>We use industry-standard SSL encryption to protect your data during transmission and store it securely on our servers.</p>`,
      lastUpdatedBy: superAdmin._id,
    },
    {
      key: 'terms',
      title: 'Terms of Service',
      content: `<h2>Terms of Service</h2><p>By using Avyuktha Fashions, you agree to these terms. Please read them carefully.</p><h3>Products</h3><p>We make every effort to display accurate colors and descriptions, but slight variations may occur due to screen settings.</p><h3>Pricing</h3><p>All prices are in Indian Rupees (INR) and include GST where applicable.</p><h3>Returns</h3><p>We accept returns within 7 days of delivery. Items must be unworn and in original packaging.</p>`,
      lastUpdatedBy: superAdmin._id,
    },
    {
      key: 'returns',
      title: 'Return Policy',
      content: `<h2>Return & Refund Policy</h2><p>Your satisfaction is our priority. We offer hassle-free returns within 7 days of delivery.</p><h3>Eligible Items</h3><p>Items must be unworn, unwashed, and in original packaging with tags attached.</p><h3>Return Process</h3><ol><li>Login to your account</li><li>Go to My Orders</li><li>Select the item and raise a return request</li><li>Our team will arrange a pickup within 2-3 business days</li><li>Refund will be processed within 5-7 business days</li></ol>`,
      lastUpdatedBy: superAdmin._id,
    },
    {
      key: 'shipping',
      title: 'Shipping Policy',
      content: `<h2>Shipping Policy</h2><h3>Free Shipping</h3><p>We offer free standard shipping on all orders above ₹999.</p><h3>Delivery Timeline</h3><ul><li>Metro cities: 2-4 business days</li><li>Other cities: 4-7 business days</li><li>Remote areas: 7-10 business days</li></ul><h3>Order Tracking</h3><p>Once your order is shipped, you will receive a tracking link via email and SMS.</p>`,
      lastUpdatedBy: superAdmin._id,
    },
  ]);
  console.log('CMS pages created');

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n✅ Seed complete!\n');
  console.log('─'.repeat(50));
  console.log('ADMIN CREDENTIALS:');
  console.log('  Super Admin: superadmin@avyuktha.com / Admin@123');
  console.log('  Admin:       admin@avyuktha.com / Admin@123');
  console.log('  Manager:     manager@avyuktha.com / Admin@123');
  console.log('─'.repeat(50));
  console.log('CUSTOMER CREDENTIALS:');
  console.log('  Customer 1:  priya@example.com / Customer@123');
  console.log('  Customer 2:  anitha@example.com / Customer@123');
  console.log('─'.repeat(50));
  console.log(`Products: ${products.length}`);
  console.log(`Categories: ${categories.length}`);
  console.log(`Collections: ${collections.length}`);
  console.log(`Orders: ${orders.length}`);
  console.log(`Reviews: ${insertedReviews.length}`);
  console.log('─'.repeat(50));

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
