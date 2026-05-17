'use client';

import { Bell, Menu, Moon, Sun } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import Avatar from '@/components/ui/Avatar';
import NotificationPanel from '@/components/notifications/NotificationPanel';

export default function Header() {
  const { profile } = useAuthStore();
  const { isDark, toggle } = useThemeStore();
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-40 glass border-b border-border">
      <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="RideRelief" className="w-10 h-10 object-contain" />
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-foreground leading-none">RideRelief</h1>
            <p className="text-[10px] text-muted leading-none mt-0.5">Instant Help. Anywhere.</p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggle}
            className="p-2.5 rounded-xl hover:bg-border/50 transition-colors text-muted"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-xl hover:bg-border/50 transition-colors text-muted relative"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />
            </button>
            {showNotifications && (
              <NotificationPanel onClose={() => setShowNotifications(false)} />
            )}
          </div>

          {/* Avatar */}
          {profile && (
            <Avatar name={profile.name} size="sm" />
          )}
        </div>
      </div>
    </header>
  );
}
