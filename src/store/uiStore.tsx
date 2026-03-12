import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

//TODO: Check if this is needed

// Navbar has a button that opens a panel in a completely different part of the tree

/* function Navbar() {
    const open = useUIStore((s) => s.openCommandPalette); // triggers...
  }
  
  function CommandPalette() {
    const isOpen = useUIStore((s) => s.commandPaletteOpen); // ...this, far away
  }
 */

// example code from the documentation

/* interface UIState {
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  selectedUserIds: Set<string>;

  toggleSidebar: () => void;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleUserSelection: (id: string) => void;
  clearUserSelection: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      sidebarOpen: true,
      commandPaletteOpen: false,
      selectedUserIds: new Set(),

      toggleSidebar: () =>
        set((s) => ({ sidebarOpen: !s.sidebarOpen })),

      openCommandPalette: () => set({ commandPaletteOpen: true }),
      closeCommandPalette: () => set({ commandPaletteOpen: false }),

      toggleUserSelection: (id) =>
        set((s) => {
          const next = new Set(s.selectedUserIds);
          next.has(id) ? next.delete(id) : next.add(id);
          return { selectedUserIds: next };
        }),

      clearUserSelection: () => set({ selectedUserIds: new Set() }),
    }),
    { name: 'UIStore' }
  )
); */