import { Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { AuthRequest } from '../../middleware/auth.middleware';
import { getNotificationsForUser, markAsRead, markAllAsRead } from './notification.service';

export const listNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const notifications = await getNotificationsForUser(req.user!.id);
  res.json({ success: true, notifications });
});

export const readOne = asyncHandler(async (req: AuthRequest, res: Response) => {
  await markAsRead(req.params.id, req.user!.id);
  res.json({ success: true });
});

export const readAll = asyncHandler(async (req: AuthRequest, res: Response) => {
  await markAllAsRead(req.user!.id);
  res.json({ success: true });
});
