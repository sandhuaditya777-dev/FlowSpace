'use client';

import { useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket';
import type { Task } from '@/api/types';

/**
 * Listens for realtime task events (task:created, task:updated, task:deleted)
 * and intelligently updates the TanStack Query cache without a full refetch.
 */
export function useRealtimeTasks(projectId: string | null) {
  const queryClient = useQueryClient();

  const handleTaskCreated = useCallback(
    (task: Task) => {
      if (task.projectId !== projectId) return;
      queryClient.setQueryData<Task[]>(['tasks', projectId], (old = []) => {
        // Avoid duplicates
        if (old.some((t) => t._id === task._id)) return old;
        return [task, ...old];
      });
    },
    [projectId, queryClient],
  );

  const handleTaskUpdated = useCallback(
    (task: Task) => {
      if (task.projectId !== projectId) return;
      queryClient.setQueryData<Task[]>(['tasks', projectId], (old = []) =>
        old.map((t) => (t._id === task._id ? { ...t, ...task } : t)),
      );
      // Also update the individual task cache
      queryClient.setQueryData(['task', task._id], task);
    },
    [projectId, queryClient],
  );

  const handleTaskDeleted = useCallback(
    (data: { _id: string; projectId: string }) => {
      if (data.projectId !== projectId) return;
      queryClient.setQueryData<Task[]>(['tasks', projectId], (old = []) =>
        old.filter((t) => t._id !== data._id),
      );
    },
    [projectId, queryClient],
  );

  useEffect(() => {
    if (!projectId) return;
    const socket = getSocket();
    socket.on('task:created', handleTaskCreated);
    socket.on('task:updated', handleTaskUpdated);
    socket.on('task:deleted', handleTaskDeleted);

    return () => {
      socket.off('task:created', handleTaskCreated);
      socket.off('task:updated', handleTaskUpdated);
      socket.off('task:deleted', handleTaskDeleted);
    };
  }, [projectId, handleTaskCreated, handleTaskUpdated, handleTaskDeleted]);
}
