import { api } from './api-client';

export interface ActivityEntry {
  _id: string;
  actorId: string;
  actorName: string;
  entityType: string;
  entityId: string;
  projectId: string;
  workspaceId: string;
  action: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export async function fetchActivityForEntity(entityId: string, limit = 50): Promise<ActivityEntry[]> {
  return api.get<ActivityEntry[]>(`/activity/entity/${entityId}?limit=${limit}`);
}

export async function fetchActivityForProject(projectId: string, limit = 100): Promise<ActivityEntry[]> {
  return api.get<ActivityEntry[]>(`/activity/project/${projectId}?limit=${limit}`);
}
