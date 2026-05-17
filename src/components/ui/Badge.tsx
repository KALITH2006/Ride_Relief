'use client';

import { cn } from '@/lib/utils';
import type { BookingStatus } from '@/lib/types';
import { STATUS_LABELS, STATUS_CLASSES } from '@/lib/types';

interface BadgeProps {
  status?: BookingStatus | 'sos';
  label?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export default function Badge({ status, label, className, size = 'sm' }: BadgeProps) {
  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  if (status) {
    return (
      <span
        className={cn(
          'inline-flex items-center font-semibold rounded-full',
          sizeStyles[size],
          STATUS_CLASSES[status],
          className
        )}
      >
        {status === 'sos' ? '🚨 SOS' : STATUS_LABELS[status]}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full bg-primary/10 text-primary border border-primary/20',
        sizeStyles[size],
        className
      )}
    >
      {label}
    </span>
  );
}
