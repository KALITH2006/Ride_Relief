'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Car, Clock, User } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

const customerLinks = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/book', label: 'Book', icon: Car },
  { href: '/bookings', label: 'History', icon: Clock },
  { href: '/profile', label: 'Profile', icon: User },
];

const driverLinks = [
  { href: '/driver/dashboard', label: 'Home', icon: Home },
  { href: '/driver/jobs', label: 'Jobs', icon: Car },
  { href: '/driver/earnings', label: 'Earnings', icon: Clock },
  { href: '/driver/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { profile } = useAuthStore();

  const links = profile?.role === 'driver' ? driverLinks : customerLinks;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass border-t border-border" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around px-2 py-1.5 max-w-lg mx-auto">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[60px]',
                isActive
                  ? 'text-primary scale-105'
                  : 'text-muted hover:text-foreground'
              )}
            >
              <div className={cn(
                'p-1.5 rounded-xl transition-all duration-200',
                isActive && 'bg-primary/10'
              )}>
                <link.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
