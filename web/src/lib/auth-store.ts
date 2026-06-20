'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from './types';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserProfile | null;
  setSession: (tokens: { access_token: string; refresh_token: string }, user: UserProfile) => void;
  setTokens: (access_token: string, refresh_token: string) => void;
  setUser: (user: UserProfile | null) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setSession: (tokens, user) =>
        set({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          user,
        }),
      setTokens: (access_token, refresh_token) =>
        set({ accessToken: access_token, refreshToken: refresh_token }),
      setUser: (user) => set({ user }),
      clearSession: () =>
        set({ accessToken: null, refreshToken: null, user: null }),
    }),
    { name: 'durmusbaba-auth' },
  ),
);

export function getRoleHome(role: string) {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'vendor') return '/vendor/dashboard';
  return '/';
}
