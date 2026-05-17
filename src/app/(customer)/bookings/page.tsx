'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, Car, Filter, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { useBookingStore } from '@/stores/bookingStore';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { formatCurrency, getRelativeTime } from '@/lib/utils';
import { SERVICE_LABELS, type BookingStatus } from '@/lib/types';

const statusFilters: (BookingStatus | 'all')[] = ['all', 'requested', 'assigned', 'on_the_way', 'completed', 'cancelled'];

export default function BookingsPage() {
  const { profile } = useAuthStore();
  const { bookings, isLoadingBookings, loadBookings } = useBookingStore();
  const [filter, setFilter] = useState<BookingStatus | 'all'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (profile?.uid) loadBookings(profile.uid);
  }, [profile?.uid, loadBookings]);

  const filtered = bookings.filter((b) => {
    if (filter !== 'all' && b.status !== filter) return false;
    if (search && !b.pickup.address.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">My Bookings</h2>
        <p className="text-sm text-muted">View your trip history</p>
      </div>

      {/* Search */}
      <Input
        id="search-bookings"
        placeholder="Search by location..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        icon={<Search size={16} />}
      />

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              filter === s
                ? 'gradient-primary text-white'
                : 'bg-surface border border-border text-muted hover:border-primary/30'
            }`}
          >
            {s === 'all' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {isLoadingBookings ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="text-center py-12">
          <Calendar className="mx-auto text-muted mb-3" size={40} />
          <h3 className="font-semibold text-foreground">No bookings found</h3>
          <p className="text-sm text-muted mt-1">
            {filter !== 'all' ? 'Try a different filter' : 'Book your first ride!'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              <Link href={`/bookings/${b.id}`}>
                <Card hoverable>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Car className="text-primary" size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {SERVICE_LABELS[b.serviceType]}
                        </p>
                        <p className="text-xs text-muted">{getRelativeTime(b.createdAt)}</p>
                      </div>
                    </div>
                    <Badge status={b.isSOS ? 'sos' : b.status} />
                  </div>

                  <div className="space-y-1.5 ml-1">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-muted">{b.pickup.address}</span>
                    </div>
                    {b.drop && (
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-muted">{b.drop.address}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                    <span className="text-sm font-bold text-primary">{formatCurrency(b.amount)}</span>
                    <span className="text-xs text-muted">#{b.id.slice(0, 8)}</span>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
