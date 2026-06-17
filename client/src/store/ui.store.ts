import { create } from 'zustand';

interface UIState {
  activeOrgId: string | null;
  activeWorkspaceId: string | null;
  activeProjectId: string | null;
  setActiveOrgId: (id: string | null) => void;
  setActiveWorkspaceId: (id: string | null) => void;
  setActiveProjectId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeOrgId: null,
  activeWorkspaceId: null,
  activeProjectId: null,
  setActiveOrgId: (activeOrgId) => set({ activeOrgId }),
  setActiveWorkspaceId: (activeWorkspaceId) => set({ activeWorkspaceId }),
  setActiveProjectId: (activeProjectId) => set({ activeProjectId }),
}));
