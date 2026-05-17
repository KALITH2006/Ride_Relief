'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, AlertTriangle } from 'lucide-react';
import LiveTrackingMap from '@/components/maps/LiveTrackingMap';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import type { BookingStatus } from '@/lib/types';

// Demo booking data for testing
const DEMO_BOOKING = {
  id: 'bk_demo_track',
  driverId: 'demo_driver_raj',
  driverName: 'Rajesh Kumar',
  driverPhone: '+91 98765 43210',
  customerLocation: { lat: 12.9716, lng: 77.5946 },
  pickupAddress: 'MG Road, Bangalore',
  dropAddress: 'Whitefield, Bangalore',
  dropLocation: { lat: 12.9698, lng: 77.7500 },
  status: 'on_the_way' as BookingStatus,
  serviceType: 'acting_driver',
  otp: '482913',
  otpVerified: false,
};

export default function TrackBookingPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = use(params);
  const router = useRouter();
  const { profile } = useAuthStore();
  const [booking, setBooking] = useState(DEMO_BOOKING);

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
          driverId={booking.driverId}
          driverName={booking.driverName}
          driverPhone={booking.driverPhone}
          customerLocation={booking.customerLocation}
          pickupAddress={booking.pickupAddress}
          dropAddress={booking.dropAddress}
          dropLocation={booking.dropLocation}
          status={booking.status}
          serviceType={booking.serviceType}
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
          const phone = process.env.NEXT_PUBLIC_SOS_PHONE || '+911234567890';
          window.open(`tel:${phone}`);
        }}>
          <AlertTriangle size={18} /> Emergency SOS
        </Button>
      </motion.div>
    </div>
  );
}
