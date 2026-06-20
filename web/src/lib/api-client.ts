'use client';

import { useAuthStore } from './auth-store';
import type { UserProfile } from './types';

/** Same-origin route via nginx — never hardcode localhost in the client bundle. */
const API_URL = '/api/v1';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function refreshTokens(): Promise<boolean> {
  const { refreshToken, setTokens, clearSession } = useAuthStore.getState();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) {
      clearSession();
      return false;
    }
    const data = (await res.json()) as {
      access_token: string;
      refresh_token: string;
    };
    setTokens(data.access_token, data.refresh_token);
    return true;
  } catch {
    clearSession();
    return false;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const { accessToken } = useAuthStore.getState();
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401 && retry) {
    const refreshed = await refreshTokens();
    if (refreshed) return apiFetch<T>(path, options, false);
  }

  if (!res.ok) {
    let message = res.statusText;
    try {
      const err = (await res.json()) as { message?: string | string[] };
      message = Array.isArray(err.message) ? err.message.join(', ') : err.message ?? message;
    } catch {
      /* ignore */
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function login(email: string, password: string) {
  const tokens = await apiFetch<{ access_token: string; refresh_token: string }>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    },
    false,
  );
  useAuthStore.getState().setTokens(tokens.access_token, tokens.refresh_token);
  const profile = await apiFetch<UserProfile>('/auth/profile');
  useAuthStore.getState().setSession(tokens, profile);
  return profile;
}

export async function register(name: string, email: string, password: string) {
  await apiFetch('/users', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  }, false);
  return login(email, password);
}

export async function logout() {
  const { refreshToken, clearSession } = useAuthStore.getState();
  if (refreshToken) {
    try {
      await apiFetch('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      }, false);
    } catch {
      /* ignore */
    }
  }
  clearSession();
}

export async function fetchProfile() {
  const profile = await apiFetch<UserProfile>('/auth/profile');
  useAuthStore.getState().setUser(profile);
  return profile;
}

export function getApiUrl() {
  return API_URL;
}
