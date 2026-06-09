export interface ProductVariant {
  _id?: string;
  sku: string;
  stock: number;
  images?: string[];
  attributes?: Record<string, string>;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  productType: string;
  category: { _id: string; name: string; slug: string };
  collections: { _id: string; name: string; slug: string }[];
  attributes?: Record<string, string[]>;
  weightGrams?: number;
  mrp: number;
  salePrice: number;
  discountPercentage: number;
  variants: ProductVariant[];
  images: string[];
  ratings: { average: number; count: number };
  isNewArrival: boolean;
  isBestSeller: boolean;
  isTrending: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  productType?: string;
  image?: string;
}

export interface Collection {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  bannerImage?: string;
}

export interface ProductType {
  _id: string;
  name: string;
  slug: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
}

export interface Paginated<T> {
  data: T[];
  pagination?: { page: number; limit: number; total: number; pages: number };
}

export interface CartItem {
  product: Product;
  variantSku: string;
  quantity: number;
  price: number;
}

export interface Cart {
  _id?: string;
  items: CartItem[];
  coupon?: { code: string; type: string; value: number };
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
  isDefault?: boolean;
}

export type OrderStatus =
  | 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'returned' | 'cancelled';

export interface OrderItem {
  product: { _id: string; name: string; slug: string; images: string[] };
  variant: { sku: string; attributes?: Record<string, string>; images?: string[] };
  quantity: number;
  price: number;
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
  status: OrderStatus;
  awbCode?: string;
  trackingUrl?: string;
  createdAt: string;
}
