import { create } from 'zustand';

interface UIState {
  activeWorkspaceId: string | null;
  activeProjectId: string | null;
  setActiveWorkspaceId: (id: string | null) => void;
  setActiveProjectId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeWorkspaceId: null,
  activeProjectId: null,
  setActiveWorkspaceId: (activeWorkspaceId) => set({ activeWorkspaceId }),
  setActiveProjectId: (activeProjectId) => set({ activeProjectId }),
}));
