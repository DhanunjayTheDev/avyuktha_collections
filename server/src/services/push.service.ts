import Expo from 'expo-server-sdk';
import { Types } from 'mongoose';
import User from '../models/User';
import Notification, { NotificationType } from '../models/Notification';
import { emitEvent } from '../config/socket';
import logger from '../utils/logger';

const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });

export interface PushPayload {
  userId: Types.ObjectId | string;
  title: string;
  body: string;
  type: NotificationType;
  orderId?: string;
  orderNumber?: string;
}

/**
 * Persist a notification to DB, emit socket event, and send Expo push if token exists.
 * All errors are swallowed — push failures must never block the order flow.
 */
export const sendPushToUser = async (payload: PushPayload): Promise<void> => {
  const { userId, title, body, type, orderId, orderNumber } = payload;

  try {
    // 1. Persist in DB so the in-app notifications screen can show it
    const notification = await Notification.create({ user: userId, title, body, type, orderId, orderNumber });

    // 2. Socket emit so the app reacts immediately if it is open
    emitEvent('notification:new', {
      userId: String(userId),
      notification: {
        _id: String(notification._id),
        title,
        body,
        type,
        orderId,
        orderNumber,
        isRead: false,
        createdAt: notification.createdAt,
      },
    });
  } catch (err) {
    logger.error(`Notification DB save failed: ${err}`);
  }

  // 3. Expo push notification (fire-and-forget)
  try {
    const user = await User.findById(userId).select('pushToken');
    if (!user?.pushToken || !Expo.isExpoPushToken(user.pushToken)) return;

    const chunks = expo.chunkPushNotifications([{
      to: user.pushToken,
      sound: 'default',
      title,
      body,
      data: { type, orderId, orderNumber },
      channelId: 'default',
    }]);

    for (const chunk of chunks) {
      const tickets = await expo.sendPushNotificationsAsync(chunk);
      for (const ticket of tickets) {
        if (ticket.status === 'error') {
          logger.warn(`Expo push error: ${ticket.message}`);
          if ((ticket as { details?: { error?: string } }).details?.error === 'DeviceNotRegistered') {
            await User.findByIdAndUpdate(userId, { $unset: { pushToken: 1 } });
          }
        }
      }
    }
  } catch (err) {
    logger.error(`Expo push send failed: ${err}`);
  }
};

const STATUS_CONTENT: Record<string, { title: string; body: (num: string) => string; type: NotificationType }> = {
  confirmed:  { title: '✅ Order Confirmed',   body: (n) => `Your order #${n} is confirmed and being processed.`,       type: 'order_confirmed' },
  packed:     { title: '📦 Order Packed',       body: (n) => `Your order #${n} is packed and ready to ship.`,            type: 'order_status_changed' },
  shipped:    { title: '🚚 Order Shipped',      body: (n) => `Your order #${n} is on its way!`,                          type: 'order_shipped' },
  delivered:  { title: '🎉 Order Delivered',    body: (n) => `Your order #${n} has been delivered. Enjoy!`,              type: 'order_delivered' },
  cancelled:  { title: '❌ Order Cancelled',    body: (n) => `Your order #${n} has been cancelled.`,                    type: 'order_cancelled' },
  returned:   { title: '↩️ Return Processed',   body: (n) => `Return for order #${n} has been processed.`,              type: 'order_status_changed' },
};

export const getStatusPushContent = (
  status: string,
  orderNumber: string
): { title: string; body: string; type: NotificationType } => {
  const entry = STATUS_CONTENT[status];
  if (entry) return { title: entry.title, body: entry.body(orderNumber), type: entry.type };
  return { title: 'Order Update', body: `Your order #${orderNumber} status changed to ${status}.`, type: 'order_status_changed' };
};
