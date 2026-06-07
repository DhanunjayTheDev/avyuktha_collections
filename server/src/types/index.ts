import { Request } from 'express';
import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: 'customer' | 'super_admin' | 'admin' | 'manager' | 'content_editor' | 'support_executive';
  isEmailVerified: boolean;
  isActive: boolean;
  avatar?: string;
  addresses: IAddress[];
  refreshTokens: string[];
  otp?: string;
  otpExpiry?: Date;
  passwordResetToken?: string;
  passwordResetExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

export interface IAddress {
  _id?: Types.ObjectId;
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

export interface AuthRequest extends Request {
  user?: IUser;
}

export interface IProductVariant {
  color?: string;
  size?: string;
  fabric?: string;
  pattern?: string;
  sku: string;
  stock: number;
  images?: string[];
}

export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: Types.ObjectId;
  subcategory?: string;
  collections: Types.ObjectId[];
  mrp: number;
  salePrice: number;
  discountPercentage: number;
  variants: IProductVariant[];
  images: string[];
  videos?: string[];
  tags: string[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isTrending: boolean;
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
  ratings: { average: number; count: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderItem {
  product: Types.ObjectId;
  variant: IProductVariant;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  orderId: string;
  user: Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IAddress;
  subtotal: number;
  shippingCharge: number;
  discount: number;
  total: number;
  coupon?: Types.ObjectId;
  paymentMethod: 'razorpay' | 'upi' | 'card' | 'netbanking' | 'cod';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  status: 'pending' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'returned' | 'cancelled';
  shiprocketOrderId?: string;
  awbCode?: string;
  trackingUrl?: string;
  cancelReason?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = IUser['role'];

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
  sort?: string;
}

export interface ApiResponse<T = unknown> {
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
