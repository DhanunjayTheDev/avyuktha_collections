import { create } from 'zustand';
import { api } from '../lib/api';
import { tokenStore } from '../lib/tokenStore';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  hydrated: boolean; // finished checking stored token on launch
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; phone: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  hydrated: false,

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { accessToken, refreshToken, user } = data.data;
    await tokenStore.set(accessToken, refreshToken);
    set({ user, isAuthenticated: true });
  },

  register: async (payload) => {
    await api.post('/auth/register', payload);
    // Server sends OTP; verification handled on its screen. No tokens yet.
  },

  logout: async () => {
    const refresh = await tokenStore.getRefresh();
    try { if (refresh) await api.post('/auth/logout', { refreshToken: refresh }); } catch { /* ignore */ }
    await tokenStore.clear();
    set({ user: null, isAuthenticated: false });
  },

  // On launch: if a token exists, fetch the current user.
  hydrate: async () => {
    const token = await tokenStore.getAccess();
    if (!token) { set({ hydrated: true }); return; }
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.data, isAuthenticated: true, hydrated: true });
    } catch {
      await tokenStore.clear();
      set({ user: null, isAuthenticated: false, hydrated: true });
    }
  },
}));
