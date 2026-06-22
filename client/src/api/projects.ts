import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from './api-client';
import type { Project, Workflow } from './types';

// ── Queries ──────────────────────────────────────────────────────────────────

export function useProjects(workspaceId: string | null) {
  return useQuery<Project[]>({
    queryKey: ['projects', workspaceId],
    queryFn: () => api.get<Project[]>(`/projects/workspace/${workspaceId}`),
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

export function useProjectWorkflows(projectId: string | null) {
  return useQuery<Workflow[]>({
    queryKey: ['workflows', projectId],
    queryFn: () => api.get<Workflow[]>(`/projects/${projectId}/workflows`),
    enabled: !!projectId,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      workspaceId: string;
      organizationId: string;
      description?: string;
      color?: string;
      priority?: string;
    }) => api.post<Project>('/projects', data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['projects', res.workspaceId] });
      toast.success(`Project "${res.name}" created!`);
    },
    onError: (err: Error) => toast.error(`Failed to create project: ${err.message}`),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: {
      id: string;
      data: Partial<{ name: string; description: string; color: string; status: string; priority: string }>;
    }) => api.patch<Project>(`/projects/${id}`, data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['projects', res.workspaceId] });
      qc.invalidateQueries({ queryKey: ['project', res._id] });
      toast.success(`Project "${res.name}" updated!`);
    },
    onError: (err: Error) => toast.error(`Failed to update project: ${err.message}`),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, workspaceId }: { id: string; workspaceId: string }) =>
      api.delete<{ message: string }>(`/projects/${id}`).then((r) => ({ ...r, workspaceId })),
    onSuccess: (_res, { workspaceId }) => {
      qc.invalidateQueries({ queryKey: ['projects', workspaceId] });
      toast.success('Project deleted.');
    },
    onError: (err: Error) => toast.error(`Failed to delete project: ${err.message}`),
  });
}
