'use client';

import { useEffect } from 'react';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { get as apiGet } from '@/lib/apiClient';
import { toast } from 'sonner';
import { useAuthStore } from './authStore';

interface WorkspaceMember {
  id: string | null;
  membershipId: string;
  email: string;
  role: string;
  status: 'active' | 'pending';
  firstName: string;
  lastName: string;
  phone: string;
}

interface WorkspacePermission {
  id: string;
  name: string;
  description: string;
}

interface Workspace {
  id: string;
  name: string;
  domain: string;
  owner: {
    id: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    } | null;
  } | null;
  members: WorkspaceMember[];
  role: string;
  currentUserId: string;
  permissions: WorkspacePermission[];
}

interface WorkspaceState {
  workspace: Workspace | null;
  loading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastRefreshTime: Date | null;
  currentWorkspaceId: string | null;
}

interface WorkspaceActions {
  refreshWorkspace: (silent?: boolean) => Promise<void>;
  refreshPermissions: () => Promise<void>;
  triggerImmediatePermissionRefresh: () => Promise<void>;
  updateWorkspaceMembers: (members: WorkspaceMember[]) => void;
  addWorkspaceMember: (member: WorkspaceMember) => void;
  removeWorkspaceMember: (membershipId: string) => void;
  updateWorkspaceMember: (membershipId: string, updates: Partial<WorkspaceMember>) => void;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  resetWorkspace: () => void;
  handleWorkspaceDeletion: () => Promise<void>;
  checkForNewWorkspace: () => Promise<void>;
  hasPermission: (permissionName: string) => boolean;
}

export type WorkspaceStore = WorkspaceState & WorkspaceActions;

const getStoredWorkspaceId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('currentWorkspaceId');
};

const setStoredWorkspaceId = (id: string | null) => {
  if (typeof window === 'undefined') return;
  if (id) {
    localStorage.setItem('currentWorkspaceId', id);
  } else {
    localStorage.removeItem('currentWorkspaceId');
  }
};

const fetchUserPermissions = async (workspaceId: string): Promise<WorkspacePermission[]> => {
  try {
    return await apiGet<WorkspacePermission[]>(
      `/identity/workspaces/${workspaceId}/permissions/me`,
    );
  } catch {
    console.error('Failed to fetch user permissions');
    return [];
  }
};

let errorShown = false;

export const useWorkspaceStore = create<WorkspaceStore>()(
  devtools(
    immer((set, get) => ({
      workspace: null,
      loading: true,
      isRefreshing: false,
      error: null,
      lastRefreshTime: null,
      currentWorkspaceId: getStoredWorkspaceId(),

      refreshWorkspace: async (silent = false) => {
        try {
          if (!silent) {
            set((s) => {
              s.loading = true;
              s.isRefreshing = true;
            });
          }
          set((s) => {
            s.error = null;
          });

          const { currentWorkspaceId, workspace: prevWorkspace } = get();
          let workspaceData: Record<string, unknown>;

          if (currentWorkspaceId) {
            workspaceData = await apiGet(`/identity/workspaces/${currentWorkspaceId}`);
          } else {
            workspaceData = await apiGet('/identity/workspaces/current');
          }

          if (!workspaceData) {
            throw new Error('Failed to load workspace data');
          }

          const wsId = workspaceData.id as string;
          setStoredWorkspaceId(wsId);

          const prevMembers = prevWorkspace?.members ?? [];
          const newMembers = (workspaceData.members as WorkspaceMember[]) ?? [];
          const membersChanged = JSON.stringify(prevMembers) !== JSON.stringify(newMembers);

          const userPermissions = await fetchUserPermissions(wsId);

          set((s) => {
            s.currentWorkspaceId = wsId;
            s.workspace = {
              id: wsId,
              name: workspaceData.name as string,
              domain: workspaceData.domain as string,
              owner: workspaceData.owner as Workspace['owner'],
              role: workspaceData.role as string,
              currentUserId: workspaceData.currentUserId as string,
              members: newMembers,
              permissions: userPermissions,
            };
            s.lastRefreshTime = new Date();
          });

          if (membersChanged && !silent && prevWorkspace) {
            const hasNewActiveMember = newMembers.some((newMember) => {
              const oldMember = prevMembers.find(
                (old) => old.membershipId === newMember.membershipId,
              );
              return oldMember?.status === 'pending' && newMember.status === 'active';
            });
            if (hasNewActiveMember) {
              toast.success('New member joined the workspace!');
            }
          }

          errorShown = false;
        } catch (error: unknown) {
          const err = error as { status?: number; message?: string };
          let errorMessage =
            'No workspace found. You can create a new workspace or wait for an invitation.';

          if (err.status === 404 || err.status === 403) {
            errorMessage =
              'No workspace found. You can create a new workspace or wait for an invitation.';
          } else if (err.status && err.status >= 500) {
            errorMessage =
              'Workspace service is temporarily unavailable. Please try again later.';
          } else if (err.status === 0) {
            errorMessage =
              'Unable to connect to workspace service. Please check your internet connection.';
          } else if (err.message) {
            const msg = err.message.toLowerCase();
            if (!msg.includes('not found') && !msg.includes('no workspace')) {
              errorMessage = err.message;
            }
          }

          set((s) => {
            s.error = errorMessage;
          });

          if (!errorShown && !silent) {
            const isServerOrNetworkError =
              (err.status && err.status >= 500) || err.status === 0;
            if (isServerOrNetworkError) {
              toast.error(errorMessage);
              errorShown = true;
            }
          }

          console.error('Failed to load workspace:', error);
        } finally {
          if (!silent) {
            set((s) => {
              s.loading = false;
              s.isRefreshing = false;
            });
          }
        }
      },

      refreshPermissions: async () => {
        const { workspace } = get();
        if (!workspace) return;

        const userPermissions = await fetchUserPermissions(workspace.id);
        set((s) => {
          if (s.workspace) s.workspace.permissions = userPermissions;
        });
      },

      triggerImmediatePermissionRefresh: async () => {
        if (!get().workspace) return;
        await get().refreshWorkspace(true);
      },

      updateWorkspaceMembers: (members) => {
        set((s) => {
          if (s.workspace) s.workspace.members = members;
        });
      },

      addWorkspaceMember: (member) => {
        set((s) => {
          if (s.workspace) s.workspace.members.push(member);
        });
      },

      removeWorkspaceMember: (membershipId) => {
        set((s) => {
          if (s.workspace) {
            s.workspace.members = s.workspace.members.filter(
              (m) => m.membershipId !== membershipId,
            );
          }
        });
      },

      updateWorkspaceMember: (membershipId, updates) => {
        set((s) => {
          if (!s.workspace) return;
          const member = s.workspace.members.find((m) => m.membershipId === membershipId);
          if (member) Object.assign(member, updates);
        });
      },

      switchWorkspace: async (workspaceId) => {
        try {
          set((s) => {
            s.loading = true;
          });

          const workspaceData = await apiGet<Record<string, unknown>>(
            `/identity/workspaces/${workspaceId}`,
          );
          if (!workspaceData) throw new Error('Failed to load workspace data');

          setStoredWorkspaceId(workspaceId);
          const userPermissions = await fetchUserPermissions(workspaceId);

          set((s) => {
            s.currentWorkspaceId = workspaceId;
            s.workspace = {
              id: workspaceData.id as string,
              name: workspaceData.name as string,
              domain: workspaceData.domain as string,
              owner: workspaceData.owner as Workspace['owner'],
              role: workspaceData.role as string,
              currentUserId: workspaceData.currentUserId as string,
              members: (workspaceData.members as WorkspaceMember[]) ?? [],
              permissions: userPermissions,
            };
          });
        } catch (error) {
          toast.error('Failed to switch workspace');
          console.error('Failed to switch workspace:', error);
        } finally {
          set((s) => {
            s.loading = false;
          });
        }
      },

      resetWorkspace: () => {
        setStoredWorkspaceId(null);
        set((s) => {
          s.workspace = null;
          s.currentWorkspaceId = null;
          s.loading = true;
        });
      },

      handleWorkspaceDeletion: async () => {
        try {
          set((s) => {
            s.loading = true;
          });

          setStoredWorkspaceId(null);
          set((s) => {
            s.currentWorkspaceId = null;
          });

          try {
            const workspaceData = await apiGet<{ id?: string }>('/identity/workspaces/current');
            if (workspaceData?.id) {
              await get().switchWorkspace(workspaceData.id);
            } else {
              get().resetWorkspace();
              toast.success(
                'Workspace deleted. You can create a new workspace from the dashboard.',
              );
            }
          } catch {
            get().resetWorkspace();
            toast.success(
              'Workspace deleted. You can create a new workspace from the dashboard.',
            );
          }
        } catch (error) {
          console.error('Failed to handle workspace deletion:', error);
          get().resetWorkspace();
          toast.success(
            'Workspace deleted. You can create a new workspace from the dashboard.',
          );
        } finally {
          set((s) => {
            s.loading = false;
          });
        }
      },

      checkForNewWorkspace: async () => {
        try {
          const workspaceData = await apiGet<{ id?: string }>('/identity/workspaces/current');
          if (workspaceData?.id && !get().workspace) {
            await get().switchWorkspace(workspaceData.id);
          }
        } catch (error) {
          console.error('Failed to check for new workspace:', error);
        }
      },

      hasPermission: (permissionName) => {
        const { workspace } = get();
        if (!workspace) return false;
        if (workspace.role === 'Owner') return true;
        return workspace.permissions.some((p) => p.name === permissionName);
      },
    })),
    { name: 'WorkspaceStore' },
  ),
);

/**
 * Drop this component once in the app layout (alongside AuthStoreInit)
 * to bootstrap workspace data and keep it in sync via polling,
 * window-focus refresh, and cross-tab storage events.
 */
export function WorkspaceStoreInit() {
  const isBootstrapping = useAuthStore((s) => s.isBootstrapping);
  const userId = useAuthStore((s) => s.user?.id);
  const workspaceId = useWorkspaceStore((s) => s.workspace?.id);
  const workspaceRole = useWorkspaceStore((s) => s.workspace?.role);

  useEffect(() => {
    if (isBootstrapping || !userId) return;
    useWorkspaceStore.getState().refreshWorkspace();
  }, [isBootstrapping, userId]);

  useEffect(() => {
    if (isBootstrapping || !userId || !workspaceId) return;
    const interval = workspaceRole === 'Owner' ? 30_000 : 120_000;
    const id = setInterval(() => {
      useWorkspaceStore.getState().refreshWorkspace(true);
    }, interval);
    return () => clearInterval(id);
  }, [isBootstrapping, userId, workspaceId, workspaceRole]);

  useEffect(() => {
    const onFocus = () => {
      if (isBootstrapping || !userId) return;
      if (useWorkspaceStore.getState().workspace) {
        useWorkspaceStore.getState().refreshWorkspace(true);
      }
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [isBootstrapping, userId, workspaceId]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (isBootstrapping || !userId) return;
      if (e.key === 'permissionChanged' && e.newValue && useWorkspaceStore.getState().workspace) {
        useWorkspaceStore.getState().refreshWorkspace(true);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [isBootstrapping, userId, workspaceId]);

  return null;
}

