'use client';

import { useEffect, useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket';
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  type Notification,
} from '@/api/notifications';

export function useRealtimeNotifications() {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetchNotifications(30),
    staleTime: 60_000,
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: fetchUnreadCount,
    staleTime: 30_000,
  });

  // Listen for real-time notifications pushed from server
  useEffect(() => {
    const socket = getSocket();
    const handler = (notif: Notification) => {
      queryClient.setQueryData<Notification[]>(['notifications'], (old = []) => [notif, ...old]);
      queryClient.setQueryData<number>(['notifications', 'unread-count'], (n = 0) => n + 1);
    };
    socket.on('notification:new', handler);
    return () => { socket.off('notification:new', handler); };
  }, [queryClient]);

  const markRead = useCallback(async (id: string) => {
    await markNotificationRead(id);
    queryClient.setQueryData<Notification[]>(['notifications'], (old = []) =>
      old.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
    );
    queryClient.setQueryData<number>(
      ['notifications', 'unread-count'],
      (n = 0) => Math.max(0, n - 1),
    );
  }, [queryClient]);

  const markAllRead = useCallback(async () => {
    await markAllNotificationsRead();
    queryClient.setQueryData<Notification[]>(['notifications'], (old = []) =>
      old.map((n) => ({ ...n, isRead: true })),
    );
    queryClient.setQueryData<number>(['notifications', 'unread-count'], 0);
  }, [queryClient]);

  return { notifications, unreadCount, isLoading, markRead, markAllRead };
}
