'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Car, Shield, Wrench, Phone, ChevronRight, Zap, MapPin, Clock, Star, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, profile, initialized } = useAuthStore();

  useEffect(() => {
    if (!initialized) return;
    if (isAuthenticated && profile) {
      if (profile.role === 'admin') router.replace('/admin/dashboard');
      else if (profile.role === 'driver') router.replace('/driver/dashboard');
      else router.replace('/dashboard');
    }
  }, [isAuthenticated, profile, initialized, router]);

  const services = [
    { 
      icon: Car, 
      title: 'Hire a Driver', 
      desc: 'Need someone to drive your car? Hire a professional, background-checked driver by the hour or for the whole day.', 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10', 
      service: 'acting_driver' 
    },
    { 
      icon: Shield, 
      title: 'Rent a Vehicle', 
      desc: 'Choose from our wide range of well-maintained cars and bikes for your next road trip or daily commute.', 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10', 
      service: 'rental' 
    },
    { 
      icon: Wrench, 
      title: 'Call a Mechanic', 
      desc: 'Car won\'t start? Flat tire? Our expert mechanics will come directly to your location to fix the issue.', 
      color: 'text-amber-500', 
      bg: 'bg-amber-500/10', 
      service: 'mechanic' 
    },
    { 
      icon: Phone, 
      title: 'Emergency SOS', 
      desc: 'Stuck in a dangerous situation? Press the SOS button for immediate, priority roadside assistance.', 
      color: 'text-red-500', 
      bg: 'bg-red-500/10', 
      service: 'emergency' 
    },
  ];

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 pb-12 pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-slate-900 opacity-90" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />

        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px]" />

        <div className="relative z-10 px-6 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-sm font-medium mb-8">
              <Star className="text-amber-400 fill-amber-400" size={14} />
              Rated 4.8/5 by 10,000+ Users
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-tight mb-6">
              Vehicle Troubles? <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                We've Got You Covered.
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Whether you need a professional driver, a rental car for the weekend, or an emergency mechanic right now—RideRelief is your all-in-one vehicle companion.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link href="/login" className="block sm:w-auto w-full">
              <Button size="lg" className="w-full sm:w-64 bg-white text-blue-700 hover:bg-slate-100 shadow-2xl font-bold py-4 text-lg rounded-2xl">
                Get Started Now
                <ChevronRight size={20} className="ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-8 bg-white dark:bg-slate-950 border-b border-border">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-4 text-center divide-x divide-border">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-1">Under 15m</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Average ETA</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-1">50+</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Cities Covered</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-1">24/7</div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Services Section */}
      <section className="py-16 px-6 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Everything Your Car Needs
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Tap a button and get exactly what you need, exactly when you need it. No hidden fees, just reliable service.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * i }}
              >
                <Link href={`/login?redirect=/book?service=${service.service}`} className="block h-full">
                  <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 group h-full">
                    <div className={`w-14 h-14 ${service.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <service.icon className={service.color} size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                      {service.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {service.desc}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Layman Friendly */}
      <section className="py-16 px-6 bg-white dark:bg-slate-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Simple. Fast. Stress-Free.
            </h2>
            <p className="text-slate-600 dark:text-slate-400">How RideRelief works in 3 easy steps</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: '1. Tell us what you need', desc: 'Open the app and select if you need a driver, mechanic, or rental car.' },
              { title: '2. We find the best match', desc: 'Our system instantly connects you with the nearest top-rated professional.' },
              { title: '3. Track and relax', desc: 'Watch them arrive on the map in real-time. Pay securely through the app.' },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-2xl mb-4">
                  {i + 1}
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Shield className="text-blue-500" size={24} />
            <span className="text-xl font-bold text-white">RideRelief</span>
          </div>
          <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
            Making vehicle ownership and travel completely hassle-free. Your safety and convenience are our top priorities.
          </p>
          <div className="flex justify-center gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
          </div>
          <p className="text-slate-600 text-sm mt-8">
            © {new Date().getFullYear()} RideRelief Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
