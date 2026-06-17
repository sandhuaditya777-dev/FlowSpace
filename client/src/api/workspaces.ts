import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from './api-client';
import type { Workspace } from './types';

// ── Queries ──────────────────────────────────────────────

export function useWorkspaces(orgId: string | null) {
  return useQuery<Workspace[]>({
    queryKey: ['workspaces', orgId],
    queryFn: () => api.get<Workspace[]>(`/workspaces/org/${orgId}`),
    enabled: !!orgId,
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
    mutationFn: (data: { name: string; organizationId: string; parentId?: string; description?: string }) =>
      api.post<Workspace>('/workspaces', data),
    onSuccess: (res, variables) => {
      qc.invalidateQueries({ queryKey: ['workspaces', variables.organizationId] });
      toast.success(`Workspace "${res.name}" created!`);
    },
    onError: (err: Error) => {
      toast.error(`Failed to create workspace: ${err.message}`);
    },
  });
}

export function useUpdateWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string } }) =>
      api.patch<Workspace>(`/workspaces/${id}`, data),
    onSuccess: (res, { id }) => {
      qc.invalidateQueries({ queryKey: ['workspaces'] });
      qc.invalidateQueries({ queryKey: ['workspace', id] });
      toast.success(`Workspace renamed to "${res.name}"!`);
    },
    onError: (err: Error) => {
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
    onError: (err: Error) => {
      toast.error(`Failed to delete workspace: ${err.message}`);
    },
  });
}
