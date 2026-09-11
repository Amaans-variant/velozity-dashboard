import { prisma } from '../../lib/prisma';
import { emitNotification, emitUnreadCount } from '../../sockets/events';

export async function createNotification(data: {
  userId: string;
  type: string;
  message: string;
  relatedTaskId?: string;
}) {
  const notif = await prisma.notification.create({ data });

  // push it live instead of making them refresh to see it - "real time via
  // websocket not polling" is a hard requirement, dont get lazy and setInterval this
  emitNotification(data.userId, notif);

  const unreadCount = await prisma.notification.count({
    where: { userId: data.userId, isRead: false },
  });
  emitUnreadCount(data.userId, unreadCount);

  return notif;
}

export async function getNotificationsForUser(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50, // dont need the entire history, just recent ones
  });
}

export async function markAsRead(notificationId: string, userId: string) {
  // the userId check here matters - otherwise anyone could mark ANY
  // notification as read just by guessing an id. small thing, easy to miss
  await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
}

export async function markAllAsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  emitUnreadCount(userId, 0);
}
