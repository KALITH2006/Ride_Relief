'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  Moon,
  Sun,
  MapPinned,
  IndianRupee,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { href: '/admin/map', label: 'Live Map', icon: MapPinned },
  { href: '/admin/pricing', label: 'Pricing', icon: IndianRupee },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();
  const { isDark, toggle } = useThemeStore();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-surface border-r border-border flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="RideRelief" className="w-10 h-10 rounded-xl object-contain" />
          <div>
            <h1 className="text-lg font-bold text-foreground">RideRelief</h1>
            <p className="text-xs text-muted">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'gradient-primary text-white shadow-lg shadow-blue-500/25'
                  : 'text-muted hover:text-foreground hover:bg-border/50'
              )}
            >
              <link.icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-border space-y-1">
        <button
          onClick={toggle}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-muted hover:text-foreground hover:bg-border/50 transition-all"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
