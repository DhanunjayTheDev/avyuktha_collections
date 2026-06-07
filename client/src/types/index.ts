export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'super_admin' | 'admin' | 'manager' | 'content_editor' | 'support_executive';
  avatar?: string;
  isEmailVerified: boolean;
  addresses: Address[];
  createdAt: string;
}

export interface Address {
  _id?: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

export interface ProductVariant {
  _id?: string;
  color?: string;
  size?: string;
  fabric?: string;
  pattern?: string;
  sku: string;
  stock: number;
  images?: string[];
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: { _id: string; name: string; slug: string };
  collections: { _id: string; name: string; slug: string }[];
  mrp: number;
  salePrice: number;
  discountPercentage: number;
  variants: ProductVariant[];
  images: string[];
  videos?: string[];
  tags: string[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isTrending: boolean;
  isActive: boolean;
  ratings: { average: number; count: number };
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: string;
  isActive: boolean;
}

export interface Collection {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  bannerImage?: string;
  isFeatured: boolean;
}

export interface CartItem {
  product: Product;
  variantSku: string;
  quantity: number;
  price: number;
}

export interface Cart {
  _id: string;
  items: CartItem[];
  coupon?: Coupon;
}

export interface Order {
  _id: string;
  orderId: string;
  items: OrderItem[];
  shippingAddress: Address;
  subtotal: number;
  shippingCharge: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  status: 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'returned' | 'cancelled';
  awbCode?: string;
  trackingUrl?: string;
  createdAt: string;
}

export interface OrderItem {
  product: { _id: string; name: string; slug: string; images: string[] };
  variant: ProductVariant;
  quantity: number;
  price: number;
}

export interface Review {
  _id: string;
  user: { _id: string; name: string; avatar?: string };
  rating: number;
  title?: string;
  body: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  type: string;
  value: number;
  minOrderValue: number;
  maxDiscount?: number;
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  author: { name: string; avatar?: string };
  category: string;
  tags: string[];
  publishedAt: string;
  views: number;
  content?: string;
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  type: 'top_bar' | 'popup' | 'promotional_banner' | 'flash_sale' | 'festival';
  image?: string;
  ctaText?: string;
  ctaLink?: string;
  bgColor?: string;
  textColor?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  sort?: string;
  category?: string;
  collection?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isTrending?: boolean;
}
