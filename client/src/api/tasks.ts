import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from './api-client';
import type { Task } from './types';

interface CreateTaskData {
  title: string;
  projectId: string;
  workspaceId: string;
  description?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  status?: string;
  assigneeId?: string;
  dueDate?: string;
  labels?: string[];
}

interface UpdateTaskData {
  title?: string;
  description?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  status?: string;
  assigneeId?: string;
  dueDate?: string;
  labels?: string[];
}

// ── Queries ──────────────────────────────────────────────
export function useTasks(projectId: string | null) {
  return useQuery<Task[]>({
    queryKey: ['tasks', projectId],
    queryFn: () => api.get<Task[]>(`/tasks?projectId=${projectId}`),
    enabled: !!projectId,
  });
}

// ── Mutations ─────────────────────────────────────────────
export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskData) => api.post<Task>('/tasks', data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['tasks', res.projectId] });
      toast.success(`Task "${res.title}" added successfully!`);
    },
    onError: (err) => {
      toast.error(`Failed to add task: ${err.message}`);
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskData }) =>
      api.patch<Task>(`/tasks/${id}`, data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['tasks', res.projectId] });
      toast.success(`Task status updated to "${res.status}".`);
    },
    onError: (err) => {
      toast.error(`Failed to update task: ${err.message}`);
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, projectId }: { id: string; projectId: string }) =>
      api.delete<any>(`/tasks/${id}`).then((r) => ({ ...r, projectId })),
    onSuccess: (_res, { projectId }) => {
      qc.invalidateQueries({ queryKey: ['tasks', projectId] });
      toast.success('Task deleted successfully.');
    },
    onError: (err) => {
      toast.error(`Failed to delete task: ${err.message}`);
    },
  });
}
