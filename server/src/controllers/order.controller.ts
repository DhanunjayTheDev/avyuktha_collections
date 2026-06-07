import { Response, NextFunction } from 'express';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';
import Coupon from '../models/Coupon';
import { AuthRequest } from '../types';
import { sendSuccess, sendError, getPagination } from '../utils/apiResponse';
import { createRazorpayOrder, verifyRazorpaySignature } from '../services/razorpay.service';
import { createShiprocketOrder } from '../services/shiprocket.service';
import { sendOrderConfirmationEmail } from '../services/email.service';

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { addressId, paymentMethod, couponCode } = req.body;

    const user = req.user!;
    const address = user.addresses.find((a) => a._id?.toString() === addressId);
    if (!address) { sendError(res, 'Address not found', 404); return; }

    const cart = await Cart.findOne({ user: user._id }).populate('items.product');
    if (!cart || !cart.items.length) { sendError(res, 'Cart is empty', 400); return; }

    let subtotal = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.product);
      if (!product || !product.isActive) { sendError(res, `Product unavailable`, 400); return; }

      const variant = product.variants.find((v) => v.sku === item.variantSku);
      if (!variant || variant.stock < item.quantity) {
        sendError(res, `Insufficient stock for ${product.name}`, 400);
        return;
      }

      const price = product.salePrice;
      subtotal += price * item.quantity;
      orderItems.push({ product: product._id, variant, quantity: item.quantity, price });
    }

    let discount = 0;
    let couponDoc;
    if (couponCode) {
      couponDoc = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (couponDoc && couponDoc.expiryDate > new Date() && subtotal >= couponDoc.minOrderValue) {
        if (couponDoc.type === 'percentage') {
          discount = (subtotal * couponDoc.value) / 100;
          if (couponDoc.maxDiscount) discount = Math.min(discount, couponDoc.maxDiscount);
        } else if (couponDoc.type === 'flat') {
          discount = couponDoc.value;
        } else if (couponDoc.type === 'free_shipping') {
          discount = 0;
        }
      }
    }

    const shippingCharge = subtotal >= 999 ? 0 : 99;
    const total = subtotal - discount + shippingCharge;

    const order = await Order.create({
      user: user._id,
      items: orderItems,
      shippingAddress: address,
      subtotal,
      shippingCharge,
      discount,
      total,
      coupon: couponDoc?._id,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
    });

    if (paymentMethod !== 'cod') {
      const rzpOrder = await createRazorpayOrder(total, 'INR', order.orderId);
      order.razorpayOrderId = rzpOrder.id;
      await order.save();

      sendSuccess(res, 'Order created', {
        orderId: order._id,
        orderNumber: order.orderId,
        razorpayOrderId: rzpOrder.id,
        amount: total,
        currency: 'INR',
      }, 201);
    } else {
      await confirmOrderFulfillment(order, user);
      sendSuccess(res, 'COD Order placed', { orderId: order._id, orderNumber: order.orderId }, 201);
    }
  } catch (err) {
    next(err);
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)) {
      sendError(res, 'Payment verification failed', 400);
      return;
    }

    const order = await Order.findById(orderId).populate('user');
    if (!order) { sendError(res, 'Order not found', 404); return; }

    order.razorpayPaymentId = razorpayPaymentId;
    order.paymentStatus = 'paid';
    await order.save();

    await confirmOrderFulfillment(order, req.user!);
    sendSuccess(res, 'Payment verified. Order confirmed.');
  } catch (err) {
    next(err);
  }
};

const confirmOrderFulfillment = async (order: InstanceType<typeof Order>, user: AuthRequest['user']) => {
  if (!user) return;

  order.status = 'confirmed';

  for (const item of order.items) {
    await Product.updateOne(
      { _id: item.product, 'variants.sku': item.variant.sku },
      { $inc: { 'variants.$.stock': -item.quantity } }
    );
  }

  if (order.coupon) {
    await Coupon.findByIdAndUpdate(order.coupon, { $inc: { usedCount: 1 } });
  }

  await order.save();
  await Cart.findOneAndUpdate({ user: user._id }, { items: [], coupon: undefined });

  try {
    await createShiprocketOrder({
      orderId: order.orderId,
      orderDate: new Date().toISOString().split('T')[0],
      customerName: order.shippingAddress.fullName,
      customerEmail: user.email,
      customerPhone: order.shippingAddress.phone,
      address: order.shippingAddress.line1,
      city: order.shippingAddress.city,
      state: order.shippingAddress.state,
      pincode: order.shippingAddress.pincode,
      items: order.items.map((i) => ({
        name: i.product.toString(),
        sku: i.variant.sku,
        units: i.quantity,
        sellingPrice: i.price,
      })),
      paymentMethod: order.paymentMethod,
      subtotal: order.subtotal,
      shippingCharge: order.shippingCharge,
    });
  } catch {
    // Shiprocket failure should not block order confirmation
  }

  await sendOrderConfirmationEmail(user.email, user.name, order.orderId, order.total);
};

export const getMyOrders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit } = req.query as Record<string, string>;
    const { page: p, limit: l, skip } = getPagination(page, limit);

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user!._id })
        .populate('items.product', 'name slug images salePrice mrp')
        .sort('-createdAt')
        .skip(skip)
        .limit(l)
        .lean(),
      Order.countDocuments({ user: req.user!._id }),
    ]);

    // Filter out items where product was deleted
    const clean = orders.map((o) => ({
      ...o,
      items: o.items.filter((i) => i.product != null),
    }));

    sendSuccess(res, 'Orders fetched', clean, 200, {
      page: p, limit: l, total, pages: Math.ceil(total / l),
    });
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user!._id })
      .populate('items.product', 'name slug images')
      .populate('coupon', 'code type value');

    if (!order) { sendError(res, 'Order not found', 404); return; }
    sendSuccess(res, 'Order details', order);
  } catch (err) {
    next(err);
  }
};

export const cancelOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user!._id });
    if (!order) { sendError(res, 'Order not found', 404); return; }

    if (!['pending', 'confirmed'].includes(order.status)) {
      sendError(res, 'Order cannot be cancelled at this stage', 400);
      return;
    }

    order.status = 'cancelled';
    order.cancelReason = req.body.reason || 'Cancelled by customer';
    await order.save();

    for (const item of order.items) {
      await Product.updateOne(
        { _id: item.product, 'variants.sku': item.variant.sku },
        { $inc: { 'variants.$.stock': item.quantity } }
      );
    }

    sendSuccess(res, 'Order cancelled');
  } catch (err) {
    next(err);
  }
};
