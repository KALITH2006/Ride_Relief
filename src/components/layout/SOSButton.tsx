'use client';

import { useState } from 'react';
import { Phone, AlertTriangle, X, MapPin, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useAuthStore } from '@/stores/authStore';
import { useBookingStore } from '@/stores/bookingStore';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

const SOS_PHONE = process.env.NEXT_PUBLIC_SOS_PHONE || '+911234567890';

export default function SOSButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const isOnline = useNetworkStatus();
  const { latitude, longitude } = useGeolocation();
  const { profile } = useAuthStore();
  const { createSOSBooking } = useBookingStore();

  const handleSMSFallback = () => {
    const message = `SOS RideRelief\nCustomer needs help.\nLocation:\nhttps://maps.google.com/?q=${latitude || 0},${longitude || 0}`;
    window.location.href = `sms:${SOS_PHONE}?body=${encodeURIComponent(message)}`;
  };

  const handleSOS = async () => {
    if (!isOnline) {
      setIsOpen(true);
      return;
    }

    if (!profile) {
      toast.error('Please log in to use SOS');
      return;
    }

    setIsSending(true);
    try {
      await createSOSBooking(profile.uid, profile.phone, {
        lat: latitude || 0,
        lng: longitude || 0,
        address: 'SOS Location (auto-detected)',
      });
      toast.success('🚨 SOS Request sent! Help is on the way.');
      setIsOpen(false);
    } catch {
      toast.error('Failed to send SOS. Try calling directly.');
    }
    setIsSending(false);
  };

  return (
    <>
      {/* Floating SOS Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-50 w-14 h-14 rounded-full bg-red-500 text-white shadow-xl flex items-center justify-center sos-pulse hover:bg-red-600 transition-colors active:scale-95"
        aria-label="SOS Emergency"
      >
        <AlertTriangle size={24} strokeWidth={2.5} />
      </button>

      {/* SOS Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-surface rounded-3xl shadow-2xl border border-border w-full max-w-sm overflow-hidden"
            >
              {/* Red Gradient Header */}
              <div className="bg-gradient-to-r from-red-500 to-rose-600 p-6 text-white text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/20 flex items-center justify-center">
                  <AlertTriangle size={32} />
                </div>
                <h2 className="text-xl font-bold">Emergency SOS</h2>
                <p className="text-sm text-red-100 mt-1">Get immediate help right now</p>
              </div>

              <div className="p-6 space-y-4">
                {!isOnline && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-sm text-amber-800 dark:text-amber-200">
                    ⚠️ You&apos;re offline. Call our support line directly.
                  </div>
                )}

                {latitude && longitude && (
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <MapPin size={14} />
                    <span>Location detected ({latitude.toFixed(4)}, {longitude.toFixed(4)})</span>
                  </div>
                )}

                {isOnline ? (
                  <Button
                    variant="danger"
                    size="lg"
                    className="w-full"
                    onClick={handleSOS}
                    isLoading={isSending}
                  >
                    {isSending ? 'Sending SOS...' : '🚨 Send SOS Request'}
                  </Button>
                ) : (
                  <Button
                    variant="danger"
                    size="lg"
                    className="w-full"
                    onClick={handleSMSFallback}
                  >
                    💬 Send Emergency SMS
                  </Button>
                )}

                <a
                  href={`tel:${SOS_PHONE}`}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border-2 border-red-500 text-red-500 font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Phone size={18} />
                  Call RideRelief Support
                </a>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 text-sm text-muted hover:text-foreground transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
