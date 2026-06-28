import { api } from './api-client';

export interface Notification {
  _id: string;
  userId: string;
  actorId: string;
  actorName: string;
  type: string;
  title: string;
  body: string;
  entityId?: string;
  entityType?: string;
  isRead: boolean;
  createdAt: string;
}

interface UnreadCountResponse {
  count: number;
}

export async function fetchNotifications(limit = 30): Promise<Notification[]> {
  return api.get<Notification[]>(`/notifications?limit=${limit}`);
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await api.get<UnreadCountResponse>('/notifications/unread-count');
  return res.count ?? 0;
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.patch(`/notifications/${id}/read`, {});
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.patch('/notifications/mark-all-read', {});
}
