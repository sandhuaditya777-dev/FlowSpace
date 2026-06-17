export interface Organization {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  isArchived: boolean;
  ownerId: string;
  settings: Record<string, unknown>;
  createdAt: string;
}

export interface OrganizationMember {
  _id: string;
  userId: string;
  organizationId: string;
  role: 'OWNER' | 'MANAGER' | 'MEMBER' | 'VIEWER';
  createdAt: string;
}

export interface Workspace {
  _id: string;
  name: string;
  slug: string;
  organizationId: string;
  ownerId: string;
  parentId: string | null;
  description?: string;
  logoUrl?: string;
  isArchived: boolean;
  members: { userId: string; role: string }[];
  createdAt: string;
}

export interface Project {
  _id: string;
  workspaceId: string;
  name: string;
  description: string;
  statuses: string[];
  memberIds: string[];
  createdAt: string;
}

export interface Task {
  _id: string;
  projectId: string;
  workspaceId: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: string;
  assigneeId: string | null;
  dueDate: string | null;
  labels: string[];
  createdBy: string;
  createdAt: string;
}

export interface User {
  sub: string;
  name: string;
  email: string;
  avatar?: string;
  roles: string[];
}
