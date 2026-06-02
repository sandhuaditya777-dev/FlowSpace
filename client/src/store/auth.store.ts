import { create } from 'zustand';

export interface User {
  sub: string;
  name: string;
  email: string;
  roles: string[];
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: false,
  login: (token, user) => set({ isAuthenticated: true, token, user, isLoading: false }),
  logout: () => set({ isAuthenticated: false, token: null, user: null, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
