'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Car, Shield, Wrench, Phone, ChevronRight,
  MapPin, Calendar, ArrowRight, Star
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useBookingStore } from '@/stores/bookingStore';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { formatCurrency, formatDateTime, getRelativeTime } from '@/lib/utils';
import type { ServiceType } from '@/lib/types';

const services = [
  { type: 'acting_driver' as ServiceType, label: 'Acting Driver', icon: Car, color: 'text-blue-500', bg: 'bg-blue-500/10', desc: 'Pro driver for your car' },
  { type: 'rental' as ServiceType, label: 'Rental Vehicle', icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-500/10', desc: 'Cars, bikes & more' },
  { type: 'mechanic' as ServiceType, label: 'Mechanic', icon: Wrench, color: 'text-amber-500', bg: 'bg-amber-500/10', desc: 'On-spot repairs' },
  { type: 'emergency' as ServiceType, label: 'Emergency', icon: Phone, color: 'text-red-500', bg: 'bg-red-500/10', desc: 'Instant help' },
];

export default function CustomerDashboard() {
  const { profile } = useAuthStore();
  const { bookings, activeBooking, isLoadingBookings, loadBookings } = useBookingStore();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  useEffect(() => {
    if (profile?.uid) loadBookings(profile.uid);
  }, [profile?.uid, loadBookings]);

  const recentBookings = bookings.slice(0, 3);

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-6">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm text-muted">{greeting} 👋</p>
        <h2 className="text-2xl font-bold text-foreground">
          {profile?.name || 'Welcome'}
        </h2>
      </motion.div>

      {/* Active Booking Banner */}
      {activeBooking && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Link href={`/bookings/${activeBooking.id}`}>
            <Card variant="gradient" hoverable className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-8 -mt-8" />
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge status={activeBooking.isSOS ? 'sos' : activeBooking.status} />
                  </div>
                  <p className="font-semibold text-foreground text-sm">Active Booking</p>
                  <p className="text-xs text-muted mt-0.5">
                    {activeBooking.pickup.address}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-primary">
                  <span className="text-xs font-medium">Track</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </Card>
          </Link>
        </motion.div>
      )}

      {/* Quick Actions - Services */}
      <div>
        <h3 className="text-lg font-bold text-foreground mb-3">What do you need?</h3>
        <div className="grid grid-cols-2 gap-3">
          {services.map((s, i) => (
            <motion.div
              key={s.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              <Link href={`/book?service=${s.type}`}>
                <Card hoverable className="group">
                  <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <s.icon className={s.color} size={22} />
                  </div>
                  <h4 className="font-semibold text-foreground text-sm">{s.label}</h4>
                  <p className="text-[11px] text-muted mt-0.5">{s.desc}</p>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Saved Location Quick Access */}
      <Card variant="gradient">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <MapPin className="text-primary" size={18} />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Quick Booking</p>
              <p className="text-xs text-muted">From your current location</p>
            </div>
          </div>
          <Link href="/book">
            <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center">
              <ArrowRight className="text-white" size={16} />
            </div>
          </Link>
        </div>
      </Card>

      {/* Recent Bookings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-foreground">Recent Trips</h3>
          <Link href="/bookings" className="text-sm text-primary font-medium flex items-center gap-1">
            View All <ChevronRight size={14} />
          </Link>
        </div>

        {isLoadingBookings ? (
          <div className="space-y-3">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : recentBookings.length === 0 ? (
          <Card className="text-center py-8">
            <Calendar className="mx-auto text-muted mb-2" size={32} />
            <p className="text-sm text-muted">No trips yet</p>
            <p className="text-xs text-muted mt-1">Book your first ride!</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentBookings.map((b) => (
              <Link key={b.id} href={`/bookings/${b.id}`}>
                <Card hoverable className="mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Car className="text-primary" size={18} />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{b.pickup.address.slice(0, 30)}...</p>
                        <p className="text-xs text-muted mt-0.5">{getRelativeTime(b.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge status={b.isSOS ? 'sos' : b.status} />
                      <p className="text-sm font-semibold text-foreground mt-1">{formatCurrency(b.amount)}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
