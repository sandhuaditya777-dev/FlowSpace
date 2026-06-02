import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from './api-client';
import type { Project } from './types';

// ── Queries ──────────────────────────────────────────────
export function useProjects(workspaceId: string | null) {
  return useQuery<Project[]>({
    queryKey: ['projects', workspaceId],
    queryFn: () => api.get<Project[]>(`/projects?workspaceId=${workspaceId}`),
    enabled: !!workspaceId,
  });
}

export function useProject(id: string | null) {
  return useQuery<Project>({
    queryKey: ['project', id],
    queryFn: () => api.get<Project>(`/projects/${id}`),
    enabled: !!id,
  });
}

// ── Mutations ─────────────────────────────────────────────
export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; workspaceId: string; description?: string }) =>
      api.post<Project>('/projects', data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['projects', res.workspaceId] });
      toast.success(`Project "${res.name}" created successfully!`);
    },
    onError: (err) => {
      toast.error(`Failed to create project: ${err.message}`);
    },
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string } }) =>
      api.patch<Project>(`/projects/${id}`, data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['projects', res.workspaceId] });
      qc.invalidateQueries({ queryKey: ['project', res._id] });
      toast.success(`Project "${res.name}" updated successfully!`);
    },
    onError: (err) => {
      toast.error(`Failed to update project: ${err.message}`);
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, workspaceId }: { id: string; workspaceId: string }) =>
      api.delete<any>(`/projects/${id}`).then((r) => ({ ...r, workspaceId })),
    onSuccess: (_res, { workspaceId }) => {
      qc.invalidateQueries({ queryKey: ['projects', workspaceId] });
      toast.success('Project deleted successfully.');
    },
    onError: (err) => {
      toast.error(`Failed to delete project: ${err.message}`);
    },
  });
}
