import apiClient from './client';

export interface AppNotification {
  _id: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  meta?: Record<string, unknown>;
}

type NotificationsResponse = {
  notifications?: Array<Record<string, unknown>>;
  unreadCount?: number;
};

function normalizeNotification(raw: Record<string, unknown>): AppNotification {
  return {
    _id: String(raw._id ?? ''),
    type: String(raw.type ?? 'system'),
    title: String(raw.title ?? raw.message ?? 'Notification'),
    body: String(raw.body ?? ''),
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    read: Boolean(raw.read ?? raw.isRead ?? false),
    meta: (raw.meta as Record<string, unknown> | undefined) ?? {},
  };
}

export async function getNotifications(unreadOnly?: boolean): Promise<{
  notifications: AppNotification[];
  unreadCount: number;
}> {
  const params = unreadOnly ? { unreadOnly: 'true' } : {};
  const res = await apiClient.get('/api/user/notifications', { params });
  const data: NotificationsResponse | Record<string, unknown>[] = res.data.data ?? res.data ?? [];
  const rawNotifications = Array.isArray(data) ? data : data.notifications ?? [];

  return {
    notifications: Array.isArray(rawNotifications)
      ? rawNotifications.map(item => normalizeNotification(item as Record<string, unknown>))
      : [],
    unreadCount: Array.isArray(data) ? 0 : Number(data.unreadCount ?? 0),
  };
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiClient.put(`/api/user/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.put('/api/user/notifications/all/read');
}

export async function registerPushToken(token: string, platform: 'ios' | 'android'): Promise<void> {
  await apiClient.post('/api/user/push-tokens', { token, platform });
}

export async function unregisterPushToken(token: string): Promise<void> {
  await apiClient.delete('/api/user/push-tokens', { params: { token } });
}
