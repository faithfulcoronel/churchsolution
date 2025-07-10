import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminModeState {
  superAdminMode: boolean;
  toggleSuperAdminMode: () => void;
  setSuperAdminMode: (value: boolean) => void;
}

export const useAdminModeStore = create<AdminModeState>()(
  persist(
    (set) => ({
      superAdminMode: false,
      toggleSuperAdminMode: () =>
        set((state) => ({ superAdminMode: !state.superAdminMode })),
      setSuperAdminMode: (value) => set({ superAdminMode: value }),
    }),
    { name: 'admin-mode' }
  )
);

