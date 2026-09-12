export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

const globalNotifications = globalThis as unknown as {
  __inAppNotifications?: Map<string, InAppNotification[]>;
};

if (!globalNotifications.__inAppNotifications) {
  globalNotifications.__inAppNotifications = new Map<string, InAppNotification[]>();
}

export function createNotification({
  userId,
  title,
  message,
  link,
  metadata
}: {
  userId: string;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, any>;
}): InAppNotification {
  const store = globalNotifications.__inAppNotifications!;
  const userNotifications = store.get(userId) || [];

  const notif: InAppNotification = {
    id: 'notif_' + Math.random().toString(36).substring(2, 11),
    userId,
    title,
    message,
    link,
    isRead: false,
    createdAt: new Date().toISOString(),
    metadata
  };

  userNotifications.unshift(notif);
  if (userNotifications.length > 50) {
    userNotifications.length = 50;
  }
  store.set(userId, userNotifications);

  return notif;
}

export function getUserNotifications(userId: string): InAppNotification[] {
  const store = globalNotifications.__inAppNotifications!;
  return store.get(userId) || [];
}

export function markNotificationAsRead(userId: string, notificationId: string): boolean {
  const store = globalNotifications.__inAppNotifications!;
  const userNotifications = store.get(userId);
  if (!userNotifications) return false;

  const target = userNotifications.find(n => n.id === notificationId);
  if (target) {
    target.isRead = true;
    return true;
  }
  return false;
}