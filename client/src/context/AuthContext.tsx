import { create } from 'zustand';
import type { User } from '../api/client';

interface AuthState {
  user: User | null;
  pendingEmail: string | null;
  setUser: (user: User | null) => void;
  setPendingEmail: (email: string) => void;
  clearPendingEmail: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  pendingEmail: null,
  setUser: (user) => set({ user }),
  setPendingEmail: (email) => set({ pendingEmail: email }),
  clearPendingEmail: () => set({ pendingEmail: null }),
}));
