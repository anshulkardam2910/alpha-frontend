import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface WorkspaceState {
  // State
  activeWorkspaceId: string | null;
  recentWorkspaceIds: string[];

  // Actions
  setActiveWorkspace: (id: string) => void;
  clearActiveWorkspace: () => void;
}

/* TODO: Implement workspace store */

/* export const useWorkspaceStore = create<WorkspaceState>()(
  devtools(
    persist(
      immer((set) => ({
        activeWorkspaceId: null,
        recentWorkspaceIds: [],

        setActiveWorkspace: (id) =>
          set((state) => {
            state.activeWorkspaceId = id;
            // Track recents (max 5)
            state.recentWorkspaceIds = [
              id,
              ...state.recentWorkspaceIds.filter((r: string) => r !== id),
            ].slice(0, 5);
          }),

        clearActiveWorkspace: () =>
          set((state) => {
            state.activeWorkspaceId = null;
          }),
      })),
      {
        name: 'workspace-storage', // persisted to localStorage
        partialize: (state) => ({
          activeWorkspaceId: state.activeWorkspaceId,
          recentWorkspaceIds: state.recentWorkspaceIds,
        }),
      },
    ),
    { name: 'WorkspaceStore' },
  ),
); */
