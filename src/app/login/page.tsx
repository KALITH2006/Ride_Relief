'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Car } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      await login(email, password);
      toast.success('Welcome back! 🎉');
      // Redirect based on role happens in the dashboard
      const profile = useAuthStore.getState().profile;
      if (profile?.role === 'admin') router.push('/admin/dashboard');
      else if (profile?.role === 'driver') router.push('/driver/dashboard');
      else router.push('/dashboard');
    } catch {
      toast.error('Invalid email or password');
    }
  };

  // Demo login functions
  const demoLogin = async (role: 'customer' | 'driver' | 'admin') => {
    const demos: Record<string, { email: string; password: string }> = {
      customer: { email: 'customer@demo.com', password: 'demo123456' },
      driver: { email: 'driver@demo.com', password: 'demo123456' },
      admin: { email: 'admin@demo.com', password: 'demo123456' },
    };
    setEmail(demos[role].email);
    setPassword(demos[role].password);
    toast('Demo credentials loaded. Click Login!', { icon: '💡' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute top-10 right-5 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl" />

        <div className="relative z-10 px-6 pt-14 pb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <img src="/logo.png" alt="RideRelief" className="w-20 h-20 mx-auto mb-4 rounded-2xl object-contain drop-shadow-lg" />
            <h1 className="text-3xl font-black text-white">Welcome Back</h1>
            <p className="text-blue-100 text-sm mt-1">Sign in to continue to RideRelief</p>
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
        <form onSubmit={handleSubmit} className="space-y-5 max-w-sm mx-auto">
          <Input
            id="login-email"
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={16} />}
            autoComplete="email"
          />

          <div className="relative">
            <Input
              id="login-password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={16} />}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-muted hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm text-primary hover:underline font-medium">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            isLoading={isLoading}
          >
            Sign In
          </Button>

          <div className="text-center text-sm text-muted">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </div>

          {/* Demo Accounts */}
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted text-center mb-3">Quick Demo Access</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => demoLogin('customer')}
                className="flex-1 py-2 px-3 rounded-xl border border-border text-xs font-medium text-muted hover:border-primary hover:text-primary transition-all"
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => demoLogin('driver')}
                className="flex-1 py-2 px-3 rounded-xl border border-border text-xs font-medium text-muted hover:border-primary hover:text-primary transition-all"
              >
                Driver
              </button>
              <button
                type="button"
                onClick={() => demoLogin('admin')}
                className="flex-1 py-2 px-3 rounded-xl border border-border text-xs font-medium text-muted hover:border-primary hover:text-primary transition-all"
              >
                Admin
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
