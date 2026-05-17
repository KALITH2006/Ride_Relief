'use client';

import { useState } from 'react';
import { X, Bell, Check } from 'lucide-react';
import { getRelativeTime } from '@/lib/utils';
import type { Notification } from '@/lib/types';

// Demo notifications for UI — in production these come from Firestore
const demoNotifications: Notification[] = [
  {
    id: '1',
    userId: '',
    title: 'Booking Confirmed',
    message: 'Your acting driver booking has been confirmed.',
    type: 'booking',
    read: false,
    createdAt: new Date(Date.now() - 300000),
  },
  {
    id: '2',
    userId: '',
    title: 'Driver Assigned',
    message: 'Rajesh K. is on the way to your location.',
    type: 'booking',
    read: false,
    createdAt: new Date(Date.now() - 1800000),
  },
  {
    id: '3',
    userId: '',
    title: 'Payment Successful',
    message: '₹249 has been charged for your recent ride.',
    type: 'payment',
    read: true,
    createdAt: new Date(Date.now() - 7200000),
  },
];

interface NotificationPanelProps {
  onClose: () => void;
}

export default function NotificationPanel({ onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState(demoNotifications);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden animate-scale-in z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-primary" />
          <h3 className="font-semibold text-sm">Notifications</h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={markAllRead}
            className="p-1 rounded-lg hover:bg-border/50 transition-colors text-muted text-xs"
          >
            <Check size={14} />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-border/50 transition-colors text-muted"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="max-h-80 overflow-y-auto">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`px-4 py-3 border-b border-border/50 hover:bg-border/30 transition-colors ${
              !n.read ? 'bg-primary/5' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-primary' : 'bg-transparent'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{n.title}</p>
                <p className="text-xs text-muted mt-0.5 line-clamp-2">{n.message}</p>
                <p className="text-[10px] text-muted mt-1">{getRelativeTime(n.createdAt)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="p-8 text-center text-muted text-sm">
          No notifications yet
        </div>
      )}
    </div>
  );
}
