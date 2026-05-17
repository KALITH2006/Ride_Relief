'use client';

import { create } from 'zustand';

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
  setDark: (dark: boolean) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  isDark: false,
  toggle: () =>
    set((state) => {
      const newDark = !state.isDark;
      if (typeof window !== 'undefined') {
        document.documentElement.classList.toggle('dark', newDark);
        localStorage.setItem('riderelief-theme', newDark ? 'dark' : 'light');
      }
      return { isDark: newDark };
    }),
  setDark: (dark) => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', dark);
      localStorage.setItem('riderelief-theme', dark ? 'dark' : 'light');
    }
    set({ isDark: dark });
  },
}));
