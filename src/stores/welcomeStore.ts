import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { container } from '../lib/container';
import { TYPES } from '../lib/types';
import type { SettingService } from '../services/SettingService';

interface WelcomeState {
  hasSeenWelcome: boolean;
  setHasSeenWelcome: (value: boolean) => void;
}

const settingService = container.get<SettingService>(TYPES.SettingService);

export const useWelcomeStore = create<WelcomeState>()(
  persist(
    (set) => ({
      hasSeenWelcome: false,
      setHasSeenWelcome: (value) => {
        set({ hasSeenWelcome: value });
        settingService.setUserWelcomeFlag(value).catch(() => {});
      },
    }),
    {
      name: 'welcome-settings',
      onRehydrateStorage: () => () => {
        settingService.getUserWelcomeFlag().then(flag => {
          useWelcomeStore.setState({ hasSeenWelcome: flag });
        }).catch(() => {});
      }
    }
  )
);