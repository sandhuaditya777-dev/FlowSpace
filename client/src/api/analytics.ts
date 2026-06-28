import { api } from './api-client';

export interface ProjectAnalytics {
  byStatus:           { status: string;    count: number }[];
  byPriority:         { priority: string;  count: number }[];
  byAssignee:         { assigneeId: string; count: number }[];
  completionTimeline: { date: string;      count: number }[];
  total:              number;
  completedCount:     number;
}

export async function fetchProjectAnalytics(projectId: string): Promise<ProjectAnalytics> {
  return api.get<ProjectAnalytics>(`/analytics/project/${projectId}`);
}
