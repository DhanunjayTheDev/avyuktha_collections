import { Response, NextFunction } from 'express';
import Expo from 'expo-server-sdk';
import { AuthRequest } from '../types';
import { sendSuccess, sendError, getPagination } from '../utils/apiResponse';
import Notification from '../models/Notification';
import User from '../models/User';

export const registerPushToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token || typeof token !== 'string' || !Expo.isExpoPushToken(token)) {
      sendError(res, 'Invalid Expo push token', 400);
      return;
    }
    await User.findByIdAndUpdate(req.user!._id, { pushToken: token });
    sendSuccess(res, 'Push token registered');
  } catch (err) {
    next(err);
  }
};

export const removePushToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await User.findByIdAndUpdate(req.user!._id, { $unset: { pushToken: 1 } });
    sendSuccess(res, 'Push token removed');
  } catch (err) {
    next(err);
  }
};

export const getNotifications = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page, limit } = req.query as Record<string, string>;
    const { page: p, limit: l, skip } = getPagination(page, limit);

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ user: req.user!._id }).sort('-createdAt').skip(skip).limit(l).lean(),
      Notification.countDocuments({ user: req.user!._id }),
      Notification.countDocuments({ user: req.user!._id, isRead: false }),
    ]);

    sendSuccess(res, 'Notifications fetched', { items: notifications, unreadCount }, 200, {
      page: p, limit: l, total, pages: Math.ceil(total / l),
    });
  } catch (err) {
    next(err);
  }
};

export const markRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user!._id },
      { isRead: true },
      { new: true }
    );
    if (!result) { sendError(res, 'Notification not found', 404); return; }
    sendSuccess(res, 'Marked as read');
  } catch (err) {
    next(err);
  }
};

export const markAllRead = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await Notification.updateMany({ user: req.user!._id, isRead: false }, { isRead: true });
    sendSuccess(res, 'All notifications marked as read');
  } catch (err) {
    next(err);
  }
};
