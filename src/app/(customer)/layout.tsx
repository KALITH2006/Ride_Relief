'use client';

import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import SOSButton from '@/components/layout/SOSButton';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 pb-20">{children}</main>
      <SOSButton />
      <BottomNav />
    </div>
  );
}
