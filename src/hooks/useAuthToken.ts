import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  setToken: (token: string | null) => void;
  removeToken: () => void;
  hasToken: () => boolean;
}

export const useAuthToken = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      setToken: (token: string | null) => set({ token }),
      removeToken: () => set({ token: null }),
      hasToken: () => !!get().token,
    }),
    {
      name: 'auth-token', // localStorage key
      partialize: (state) => ({ token: state.token }), // Only persist token
    }
  )
);