'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Car, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const { resetPassword, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    try {
      await resetPassword(email);
      setSent(true);
      toast.success('Reset link sent!');
    } catch {
      toast.error('Failed to send reset email');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />

        <div className="relative z-10 px-6 pt-14 pb-12 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <img src="/logo.png" alt="RideRelief" className="w-20 h-20 mx-auto mb-4 rounded-2xl object-contain drop-shadow-lg" />
            <h1 className="text-3xl font-black text-white">Reset Password</h1>
            <p className="text-blue-100 text-sm mt-1">We&apos;ll send you a reset link</p>
          </motion.div>
        </div>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1 -mt-6 bg-background rounded-t-3xl px-6 pt-8 pb-6"
      >
        <div className="max-w-sm mx-auto">
          {sent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle className="text-success" size={32} />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Check Your Email</h2>
              <p className="text-sm text-muted mb-6">
                We&apos;ve sent a password reset link to <strong>{email}</strong>
              </p>
              <Link href="/login">
                <Button variant="outline" className="mx-auto">
                  <ArrowLeft size={16} />
                  Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                id="reset-email"
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={16} />}
              />

              <Button type="submit" size="lg" className="w-full" isLoading={isLoading}>
                Send Reset Link
              </Button>

              <Link href="/login" className="flex items-center justify-center gap-1 text-sm text-muted hover:text-primary transition-colors">
                <ArrowLeft size={14} />
                Back to Login
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
