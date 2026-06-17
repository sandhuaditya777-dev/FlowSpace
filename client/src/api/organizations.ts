import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api-client';
import type { Organization, OrganizationMember } from './types';

// ── API calls ────────────────────────────────────────────────────────────────

const orgsApi = {
  list: (): Promise<Organization[]> =>
    api.get<Organization[]>('/organizations'),
  getOne: (id: string): Promise<Organization> =>
    api.get<Organization>(`/organizations/${id}`),
  create: (dto: { name: string; description?: string; logoUrl?: string }): Promise<Organization> =>
    api.post<Organization>('/organizations', dto),
  update: (id: string, dto: Partial<{ name: string; description: string; logoUrl: string; settings: Record<string, unknown> }>): Promise<Organization> =>
    api.patch<Organization>(`/organizations/${id}`, dto),
  archive: (id: string): Promise<Organization> =>
    api.patch<Organization>(`/organizations/${id}/archive`, {}),
  delete: (id: string): Promise<void> =>
    api.delete<void>(`/organizations/${id}`),
  listMembers: (orgId: string): Promise<OrganizationMember[]> =>
    api.get<OrganizationMember[]>(`/organizations/${orgId}/members`),
  updateMember: (memberId: string, dto: { role: string }): Promise<OrganizationMember> =>
    api.patch<OrganizationMember>(`/organizations/members/${memberId}`, dto),
  removeMember: (memberId: string): Promise<void> =>
    api.delete<void>(`/organizations/members/${memberId}`),
};

// ── React Query hooks ────────────────────────────────────────────────────────

export function useOrganizations() {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: orgsApi.list,
  });
}

export function useOrganization(id: string | null) {
  return useQuery({
    queryKey: ['organizations', id],
    queryFn: () => orgsApi.getOne(id!),
    enabled: !!id,
  });
}

export function useCreateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: orgsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['organizations'] }),
  });
}

export function useUpdateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...dto }: { id: string; name?: string; description?: string; logoUrl?: string; settings?: Record<string, unknown> }) =>
      orgsApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['organizations'] }),
  });
}

export function useArchiveOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: orgsApi.archive,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['organizations'] }),
  });
}

export function useDeleteOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: orgsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['organizations'] }),
  });
}

export function useOrgMembers(orgId: string | null) {
  return useQuery({
    queryKey: ['org-members', orgId],
    queryFn: () => orgsApi.listMembers(orgId!),
    enabled: !!orgId,
  });
}
