'use client';

import { useEffect, ReactNode } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';

export default function Providers({ children }: { children: ReactNode }) {
  const initAuth = useAuthStore((s) => s.initAuth);
  const setDark = useThemeStore((s) => s.setDark);

  useEffect(() => {
    // Initialize auth listener
    const unsubscribe = initAuth();

    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('riderelief-theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDark(true);
    }

    return () => unsubscribe();
  }, [initAuth, setDark]);

  return <>{children}</>;
}
