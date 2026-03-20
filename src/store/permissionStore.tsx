'use client';

import { useEffect } from 'react';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { get as apiGet } from '@/lib/apiClient';
import { useWorkspaceStore } from './workspaceStore';
import { useAuthStore } from './authStore';
import { toast } from 'sonner';

export type PermissionName = string;

export interface Permission {
  id: string;
  name: PermissionName;
  description: string;
}

interface PermissionState {
  permissions: Permission[];
  userPermissions: Permission[];
  loading: boolean;
}

interface PermissionActions {
  refreshPermissions: () => Promise<void>;
  hasPermission: (permission: PermissionName) => boolean;
  hasAnyPermission: (permissions: PermissionName[]) => boolean;
  reset: () => void;
}

export type PermissionStore = PermissionState & PermissionActions;

export const usePermissionStore = create<PermissionStore>()(
  devtools(
    immer((set, get) => ({
      permissions: [],
      userPermissions: [],
      loading: false,

      refreshPermissions: async () => {
        const workspace = useWorkspaceStore.getState().workspace;
        if (!workspace?.id) return;

        try {
          set((s) => {
            s.loading = true;
          });

          const userPerms = await apiGet<Permission[]>(
            `/identity/workspaces/${workspace.id}/permissions/me`,
          );
          set((s) => {
            s.userPermissions = userPerms;
          });

          try {
            const allPerms = await apiGet<Permission[]>(
              `/identity/workspaces/${workspace.id}/permissions`,
            );
            set((s) => {
              s.permissions = allPerms;
            });
          } catch {
            // User might not have permission to view all workspace permissions
          }
        } catch {
          console.error('Failed to load permissions');
          toast.error('Failed to load permissions');
        } finally {
          set((s) => {
            s.loading = false;
          });
        }
      },

      hasPermission: (permission) => {
        return get().userPermissions.some((p) => p.name === permission);
      },

      hasAnyPermission: (permissions) => {
        const { userPermissions } = get();
        return permissions.some((perm) => userPermissions.some((p) => p.name === perm));
      },

      reset: () => {
        set((s) => {
          s.permissions = [];
          s.userPermissions = [];
        });
      },
    })),
    { name: 'PermissionStore' },
  ),
);

/**
 * Drop this component in the app layout (alongside WorkspaceStoreInit)
 * to keep permissions in sync whenever the active workspace or role changes.
 */
export function PermissionStoreInit() {
  const isBootstrapping = useAuthStore((s) => s.isBootstrapping);
  const userId = useAuthStore((s) => s.user?.id);
  const workspaceId = useWorkspaceStore((s) => s.workspace?.id);
  const workspaceRole = useWorkspaceStore((s) => s.workspace?.role);

  useEffect(() => {
    if (isBootstrapping) return;

    if (userId && workspaceId) {
      usePermissionStore.getState().refreshPermissions();
    } else {
      usePermissionStore.getState().reset();
    }
  }, [isBootstrapping, userId, workspaceId, workspaceRole]);

  return null;
}