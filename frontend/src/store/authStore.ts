import { create } from 'zustand';

// keeping the access token in memory (zustand state) not localStorage.
// this means a hard refresh wipes it - thats intentional, thats what the
// /auth/refresh call + HttpOnly cookie is for. yes it means you get logged
// "out" visually on refresh for a split second while it re-fetches, thats fine
interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'PM' | 'DEVELOPER';
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  setAuth: (user, accessToken) => set({ user, accessToken }),
  clearAuth: () => set({ user: null, accessToken: null }),
}));
