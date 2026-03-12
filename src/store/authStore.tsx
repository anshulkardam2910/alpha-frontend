'use client';

import { useEffect } from 'react';
import { API_CONFIG, API_ENDPOINTS } from '@/lib/api.config';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { User } from '@/modules/auth/types';

/**
 * SECURITY NOTES:
 * - Access tokens stored in memory only (Zustand state) - NOT in localStorage
 * - Refresh tokens stored in sessionStorage (slightly more secure than localStorage)
 * - User data stored in memory only - refreshed on page load from API
 * - Only minimal data stored: currentWorkspaceId in localStorage for convenience
 *
 * This prevents XSS attacks from stealing tokens from localStorage
 */

const session = {
  get: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(key, value);
    } catch {
      console.warn(`[auth] Failed to write sessionStorage key: ${key}`);
    }
  },
  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};

const cleanupOldStorage = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userProvider');
  } catch {
    // Ignore
  }
};

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isBootstrapping: boolean;
  currentWorkspace: { id?: string; [key: string]: unknown } | null;
}

export interface AuthActions {
  login: (tokens: { accessToken: string; refreshToken: string }, userData: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  updateUser: (data: Partial<User>) => void;
  clearAuth: () => void;
  restoreSession: () => Promise<void>;
  setTokens: (tokens: { accessToken?: string; refreshToken?: string }) => void;
  /** Returns true if new tokens were set. Used by apiClient on 401 to refresh and retry. */
  refreshTokens: () => Promise<string | null>;
  /** Set the current workspace. */
  setCurrentWorkspace: (workspace: { id?: string; [key: string]: unknown } | null) => void; // TODO: The [key: string]: unknown is a red flag
}

export type AuthStore = AuthState & AuthActions;

let sessionRestoreAttempted = false;

export const useAuthStore = create<AuthStore>()(
  devtools(
    immer((set, get) => ({
      user: null,
      accessToken: null,
      currentWorkspace: null,
      isBootstrapping: true,

      login: (tokens, userData) => {
        cleanupOldStorage();

        session.set('_rt', tokens.refreshToken);

        set((s) => {
          s.user = userData;
          s.accessToken = tokens.accessToken;
          s.isBootstrapping = false;
        });
      },

      logout: () => {
        session.remove('_rt');
        if (typeof window !== 'undefined') localStorage.removeItem('currentWorkspaceId');
        cleanupOldStorage();
        set((s) => {
          s.user = null;
          s.accessToken = null;
          s.isBootstrapping = false;
          s.currentWorkspace = null;
        });
      },

      updateUser: (data) => {
        set((s) => {
          if (s.user) Object.assign(s.user, data);
        });
      },

      setCurrentWorkspace: (workspace) => {
        set({ currentWorkspace: workspace });
        if (typeof window !== 'undefined' && workspace?.id) {
          localStorage.setItem('currentWorkspaceId', workspace.id);
        }
      },

      setTokens: ({ accessToken, refreshToken }) => {
        if (accessToken)
          set((s) => {
            s.accessToken = accessToken;
          });
        if (refreshToken) session.set('_rt', refreshToken);
      },

      setUser: (user) =>
        set((s) => {
          s.user = user;
        }),

      clearAuth: () => {
        session.remove('_rt');
        set((s) => {
          s.user = null;
          s.accessToken = null;
        });
      },

      restoreSession: async () => {
        if (sessionRestoreAttempted) return;
        sessionRestoreAttempted = true;

        const refreshed = await get().refreshTokens();
        if (!refreshed) {
          set({ isBootstrapping: false });
          return;
        }

        const baseUrl = API_CONFIG.BASE_URL;
        const accessToken = get().accessToken;
        if (!baseUrl || !accessToken) {
          set({ isBootstrapping: false });
          return;
        }

        try {
          const userRes = await fetch(`${baseUrl}${API_ENDPOINTS.AUTH.ME}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (!userRes.ok) throw new Error('Fetch user failed');
          const userData = await userRes.json();
          if (userData) {
            let currentWorkspace: AuthState['currentWorkspace'] = null;
            const savedWorkspaceId =
              typeof window !== 'undefined' ? localStorage.getItem('currentWorkspaceId') : null;
            if (savedWorkspaceId && userData.memberships) {
              const membership = userData.memberships.find(
                (m: { workspaceId: string; workspace?: { id: string } }) =>
                  m.workspaceId === savedWorkspaceId || m.workspace?.id === savedWorkspaceId,
              );
              currentWorkspace = membership?.workspace ?? { id: savedWorkspaceId };
            }
            set((s) => ({ ...s, user: userData, currentWorkspace }));
          }
        } catch (err: unknown) {
          const status =
            (err as { response?: { status?: number }; message?: string })?.response?.status ??
            (err as { message?: string })?.message;
          console.error('Failed to restore session:', status);

          session.remove('_rt');
          set({ accessToken: null });
          cleanupOldStorage();
        } finally {
          set({ isBootstrapping: false });
        }
      },

      /**
       * Silently refreshes tokens using the stored refresh token.
       * Returns the new access token on success, null on failure.
       *
       * Uses raw fetch (not apiClient) to avoid circular dependency
       * with the Axios interceptor that calls this.
       */
      refreshTokens: async (): Promise<string | null> => {
        const refreshToken = session.get('_rt');
        if (!refreshToken) return null;

        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!baseUrl) return null;

        try {
          const res = await fetch(`${baseUrl}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (!res.ok) {
            get().clearAuth();
            return null;
          }

          const data = await res.json();
          const { accessToken, refreshToken: newRefreshToken } = data;
          if (!accessToken) {
            get().clearAuth();
            return null;
          }

          get().setTokens({ accessToken, refreshToken: newRefreshToken });
          return accessToken;
        } catch {
          get().clearAuth();
          return null;
        }
      },
    })),
    { name: 'AuthStore' },
  ),
);

// ---------------------------------------------------------------------------
// Auth store initializer (run once in app root, e.g. layout.tsx)
// - Restores session from refresh token on mount
// - Subscribes to auth:logout and auth:token-update window events
// ---------------------------------------------------------------------------

export function AuthStoreInit() {
  useEffect(() => {
    useAuthStore.getState().restoreSession();
  }, []);

  useEffect(() => {
    const handleLogout = () => useAuthStore.getState().logout();

    const handleTokenUpdate = (
      event: CustomEvent<{ accessToken?: string; refreshToken?: string }>,
    ) => {
      const detail = event.detail;
      if (detail?.accessToken || detail?.refreshToken) {
        useAuthStore.getState().setTokens({
          accessToken: detail.accessToken,
          refreshToken: detail.refreshToken,
        });
      }
    };

    window.addEventListener('auth:logout', handleLogout as EventListener);
    window.addEventListener('auth:token-update', handleTokenUpdate as EventListener);

    return () => {
      window.removeEventListener('auth:logout', handleLogout as EventListener);
      window.removeEventListener('auth:token-update', handleTokenUpdate as EventListener);
    };
  }, []);

  return null;
}
