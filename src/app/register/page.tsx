'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, User, Phone, Car } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import type { UserRole } from '@/lib/types';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      await register(email, password, name, phone, role);
      toast.success('Account created! 🎉');
      if (role === 'driver') router.push('/driver/dashboard');
      else router.push('/dashboard');
    } catch {
      toast.error('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute bottom-5 left-5 w-48 h-48 bg-emerald-400/20 rounded-full blur-3xl" />

        <div className="relative z-10 px-6 pt-14 pb-12 text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <img src="/logo.png" alt="RideRelief" className="w-20 h-20 mx-auto mb-4 rounded-2xl object-contain drop-shadow-lg" />
            <h1 className="text-3xl font-black text-white">Join RideRelief</h1>
            <p className="text-blue-100 text-sm mt-1">Create your free account</p>
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
        <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mx-auto">
          {/* Role Selector */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">I am a</label>
            <div className="flex gap-3">
              {[
                { value: 'customer' as UserRole, label: '🚗 Customer' },
                { value: 'driver' as UserRole, label: '🚙 Driver' },
              ].map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                    role === r.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted hover:border-primary/30'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <Input
            id="register-name"
            label="Full Name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={<User size={16} />}
          />

          <Input
            id="register-email"
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={16} />}
          />

          <Input
            id="register-phone"
            label="Phone Number"
            type="tel"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            icon={<Phone size={16} />}
          />

          <div className="relative">
            <Input
              id="register-password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={16} />}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-muted hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            isLoading={isLoading}
          >
            Create Account
          </Button>

          <p className="text-center text-sm text-muted">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
