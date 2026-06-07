import client from './client';

export const orderApi = {
  createOrder: (data: { addressId: string; paymentMethod: string; couponCode?: string }) =>
    client.post('/orders', data),

  verifyPayment: (data: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => client.post('/orders/verify-payment', data),

  getMyOrders: (page = 1, limit = 10) =>
    client.get('/orders/my', { params: { page, limit } }),

  getOrderById: (id: string) =>
    client.get(`/orders/${id}`),

  cancelOrder: (id: string, reason?: string) =>
    client.patch(`/orders/${id}/cancel`, { reason }),
};
