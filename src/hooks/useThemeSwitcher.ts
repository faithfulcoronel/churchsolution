import { ChangeEvent, useEffect } from 'react';
import { useSettings } from '@/providers/SettingsProvider';

const useThemeSwitcher = () => {
  const { settings, storeSettings } = useSettings();

  const applyTheme = (theme: 'light' | 'dark') => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  };

  // Apply the currently selected theme when the hook initializes
  useEffect(() => {
    applyTheme(settings.themeMode === 'dark' ? 'dark' : 'light');
  }, [settings.themeMode]);

  const handleThemeToggle = (
    e: ChangeEvent<HTMLInputElement> | boolean
  ) => {
    const checked = typeof e === 'boolean' ? e : e.target.checked;
    const newThemeMode = checked ? 'dark' : 'light';
    storeSettings({ themeMode: newThemeMode });
    applyTheme(newThemeMode);
  };

  return { settings, handleThemeToggle };
};

export { useThemeSwitcher };
