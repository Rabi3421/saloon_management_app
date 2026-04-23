import apiClient from './client';

export interface AppNotification {
  _id: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export async function getNotifications(unreadOnly?: boolean): Promise<AppNotification[]> {
  const params = unreadOnly ? { unreadOnly: 'true' } : {};
  const res = await apiClient.get('/api/user/notifications', { params });
  return res.data.data || [];
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiClient.put(`/api/user/notifications/${id}/read`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.put('/api/user/notifications/all/read');
}
