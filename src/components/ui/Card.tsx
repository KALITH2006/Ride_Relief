'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'gradient' | 'elevated';
  onClick?: () => void;
  hoverable?: boolean;
}

export default function Card({ children, className, variant = 'default', onClick, hoverable }: CardProps) {
  const baseStyles = 'rounded-2xl transition-all duration-300';

  const variants = {
    default: 'bg-surface border border-border p-5 shadow-sm',
    glass: 'glass-card p-5',
    gradient: 'gradient-card p-5 border border-border',
    elevated: 'bg-surface p-5 shadow-lg border border-border',
  };

  const hoverStyles = hoverable
    ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:border-primary/30'
    : '';

  return (
    <div
      className={cn(baseStyles, variants[variant], hoverStyles, className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
