import { api } from './api-client';

export interface SearchResults {
  tasks: SearchTask[];
  projects: SearchProject[];
  comments: SearchComment[];
}

export interface SearchTask {
  _id: string;
  title: string;
  slug: string;
  status: string;
  priority: string;
  projectId: string;
  workspaceId: string;
  type: string;
}

export interface SearchProject {
  _id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  identifier: string;
}

export interface SearchComment {
  _id: string;
  content: string;
  taskId: string;
  projectId: string;
  authorId: string;
  createdAt: string;
}

export async function searchAll(
  q: string,
  workspaceId: string,
  limit = 5,
): Promise<SearchResults> {
  if (!q || q.trim().length < 2) {
    return { tasks: [], projects: [], comments: [] };
  }
  return api.get<SearchResults>(
    `/search?q=${encodeURIComponent(q)}&workspaceId=${workspaceId}&limit=${limit}`,
  );
}
