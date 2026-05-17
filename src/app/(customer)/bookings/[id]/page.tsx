'use client';

import { useParams, useRouter } from 'next/navigation';
import { Phone, MessageSquare, MapPin, Clock, Star, ChevronLeft, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { SERVICE_LABELS, STATUS_LABELS, type BookingStatus } from '@/lib/types';
import toast from 'react-hot-toast';

// Demo booking for UI display
const demoBooking = {
  id: 'bk_demo_12345',
  serviceType: 'acting_driver' as const,
  status: 'on_the_way' as BookingStatus,
  pickup: { lat: 12.9716, lng: 77.5946, address: 'MG Road, Bangalore, Karnataka' },
  drop: { lat: 12.9833, lng: 77.605, address: 'Indiranagar 100 Feet Road, Bangalore' },
  amount: 249,
  isSOS: false,
  driverName: 'Rajesh Kumar',
  driverPhone: '+91 98765 43210',
  eta: 8,
  distance: 5.2,
  rating: null,
  createdAt: new Date(),
  paymentStatus: 'pending' as const,
};

const statusTimeline: { status: BookingStatus; label: string }[] = [
  { status: 'requested', label: 'Booking Placed' },
  { status: 'assigned', label: 'Driver Assigned' },
  { status: 'on_the_way', label: 'On The Way' },
  { status: 'arrived', label: 'Arrived' },
  { status: 'completed', label: 'Completed' },
];

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const booking = demoBooking; // In production, fetch from Firestore by params.id

  const currentStatusIndex = statusTimeline.findIndex(s => s.status === booking.status);

  const handleChat = () => {
    toast('Chat feature coming soon.', { icon: '💬' });
  };

  const handlePayment = () => {
    toast('Processing payment...', { icon: '💳' });
  };

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-border/50 transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-foreground">Booking Details</h2>
          <p className="text-xs text-muted">#{(params.id as string)?.slice(0, 12)}</p>
        </div>
        <Badge status={booking.isSOS ? 'sos' : booking.status} size="md" />
      </div>

      {/* Map Area */}
      <div className="h-48 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 border border-border flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: 'radial-gradient(circle, var(--primary) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }} />
        </div>
        <div className="text-center z-10">
          <Navigation className="mx-auto text-primary mb-2 animate-pulse" size={28} />
          <p className="text-sm font-medium text-primary">Live Tracking</p>
          <p className="text-xs text-muted">ETA: {booking.eta} mins</p>
        </div>
      </div>

      {/* Driver Card */}
      {booking.driverName && (
        <Card variant="elevated">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar name={booking.driverName} size="lg" />
              <div>
                <h3 className="font-semibold text-foreground">{booking.driverName}</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="text-amber-400 fill-amber-400" size={12} />
                  <span className="text-xs text-muted">4.8 · 245 trips</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <a href={`tel:${booking.driverPhone}`} className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 hover:bg-emerald-500/20 transition-colors">
                <Phone size={16} />
              </a>
              <button className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors" onClick={handleChat}>
                <MessageSquare size={16} />
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Status Timeline */}
      <Card>
        <h3 className="font-semibold text-foreground mb-4">Trip Status</h3>
        <div className="space-y-0">
          {statusTimeline.map((s, i) => {
            const isCompleted = i <= currentStatusIndex;
            const isCurrent = i === currentStatusIndex;
            return (
              <div key={s.status} className="flex items-start gap-3 relative">
                {i < statusTimeline.length - 1 && (
                  <div className={`absolute left-[9px] top-6 w-0.5 h-8 ${isCompleted ? 'bg-primary' : 'bg-border'}`} />
                )}
                <div className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center ${
                  isCompleted ? 'bg-primary' : 'bg-border'
                } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}>
                  {isCompleted && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <div className="pb-6">
                  <p className={`text-sm font-medium ${isCompleted ? 'text-foreground' : 'text-muted'}`}>
                    {s.label}
                  </p>
                  {isCurrent && (
                    <p className="text-xs text-primary mt-0.5">In Progress...</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Trip Details */}
      <Card>
        <h3 className="font-semibold text-foreground mb-3">Trip Info</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1" />
            <div>
              <p className="text-xs text-muted">Pickup</p>
              <p className="text-sm font-medium text-foreground">{booking.pickup.address}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 mt-1" />
            <div>
              <p className="text-xs text-muted">Drop</p>
              <p className="text-sm font-medium text-foreground">{booking.drop?.address}</p>
            </div>
          </div>

          <hr className="border-border" />

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted">Distance</p>
              <p className="font-semibold text-foreground">{booking.distance} km</p>
            </div>
            <div>
              <p className="text-xs text-muted">ETA</p>
              <p className="font-semibold text-foreground">{booking.eta} min</p>
            </div>
            <div>
              <p className="text-xs text-muted">Fare</p>
              <p className="font-semibold text-primary">{formatCurrency(booking.amount)}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Payment */}
      <Card variant="gradient">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted">Total Amount</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(booking.amount)}</p>
          </div>
          <Button size="md" onClick={handlePayment}>
            Pay Now
          </Button>
        </div>
      </Card>
    </div>
  );
}
