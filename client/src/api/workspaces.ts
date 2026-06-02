import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from './api-client';
import type { Workspace } from './types';

// ── Queries ──────────────────────────────────────────────
export function useWorkspaces() {
  return useQuery<Workspace[]>({
    queryKey: ['workspaces'],
    queryFn: () => api.get<Workspace[]>('/workspaces'),
  });
}

export function useWorkspace(id: string | null) {
  return useQuery<Workspace>({
    queryKey: ['workspace', id],
    queryFn: () => api.get<Workspace>(`/workspaces/${id}`),
    enabled: !!id,
  });
}

// ── Mutations ─────────────────────────────────────────────
export function useCreateWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => api.post<Workspace>('/workspaces', data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['workspaces'] });
      toast.success(`Workspace "${res.name}" created successfully!`);
    },
    onError: (err) => {
      toast.error(`Failed to create workspace: ${err.message}`);
    },
  });
}

export function useUpdateWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string } }) =>
      api.patch<Workspace>(`/workspaces/${id}`, data),
    onSuccess: (res, { id }) => {
      qc.invalidateQueries({ queryKey: ['workspaces'] });
      qc.invalidateQueries({ queryKey: ['workspace', id] });
      toast.success(`Workspace renamed to "${res.name}"!`);
    },
    onError: (err) => {
      toast.error(`Failed to rename workspace: ${err.message}`);
    },
  });
}

export function useDeleteWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/workspaces/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workspaces'] });
      toast.success('Workspace deleted successfully.');
    },
    onError: (err) => {
      toast.error(`Failed to delete workspace: ${err.message}`);
    },
  });
}
