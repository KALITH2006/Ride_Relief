'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, AlertTriangle } from 'lucide-react';
import LiveTrackingMap from '@/components/maps/LiveTrackingMap';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { useTrackingStore } from '@/stores/trackingStore';
import { subscribeToBooking } from '@/lib/firestore';
import type { Booking } from '@/lib/types';
import ChatModal from '@/components/ui/ChatModal';

export default function TrackBookingPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = use(params);
  const router = useRouter();
  const { profile } = useAuthStore();
  const { joinRoom, leaveRoom, room } = useTrackingStore();
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const unsubBooking = subscribeToBooking(bookingId, (data) => {
      setBooking(data);
    });
    joinRoom(bookingId);

    return () => {
      unsubBooking();
      leaveRoom();
    };
  }, [bookingId, joinRoom, leaveRoom]);

  if (!booking) {
    return <div className="flex h-screen items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div></div>;
  }

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-border/50 text-muted hover:text-foreground transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-foreground">Live Tracking</h2>
          <p className="text-xs text-muted">Booking #{bookingId.slice(0, 12)}</p>
        </div>
      </motion.div>

      {/* Live Tracking Map */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <LiveTrackingMap
          bookingId={bookingId}
          driverId={booking.driverId || ''}
          driverName={booking.driverName || 'Finding Driver...'}
          driverPhone={undefined} // In a real app, fetch from driver profile
          customerLocation={booking.pickup}
          pickupAddress={booking.pickup.address}
          dropAddress={booking.drop?.address}
          dropLocation={booking.drop || undefined}
          status={booking.status}
          serviceType={booking.serviceType}
          trackingRoom={room}
        />
      </motion.div>

      {/* OTP Display Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card variant="gradient" className="text-center py-6 border-primary/20">
          <p className="text-sm text-muted mb-2">Provide this PIN to the provider</p>
          <div className="flex justify-center items-center gap-3">
            {booking.otp?.split('').map((digit, i) => (
              <div key={i} className="w-10 h-12 rounded-lg bg-surface/50 border border-border flex items-center justify-center text-2xl font-bold font-mono text-foreground shadow-sm">
                {digit}
              </div>
            )) || <p>No OTP generated</p>}
          </div>
          {booking.otpVerified && (
            <p className="text-emerald-500 font-medium text-sm mt-3 flex items-center justify-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Verified
            </p>
          )}
        </Card>
      </motion.div>

      {/* SOS Button */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <Button variant="danger" size="lg" className="w-full" onClick={() => {
          const phone = process.env.NEXT_PUBLIC_SOS_PHONE || '+917639834962';
          window.open(`tel:${phone}`);
        }}>
          <AlertTriangle size={18} /> Emergency SOS
        </Button>
      </motion.div>

      {/* Floating Chat */}
      <ChatModal bookingId={bookingId} />
    </div>
  );
}
