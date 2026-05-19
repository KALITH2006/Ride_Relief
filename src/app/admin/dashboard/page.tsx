'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Users, CalendarCheck, IndianRupee, Car, AlertTriangle,
  TrendingUp, ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';
import { createBooking, createSOSRequest } from '@/lib/firestore';
import type { ServiceType } from '@/lib/types';
import toast from 'react-hot-toast';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 42000 },
  { month: 'Feb', revenue: 53000 },
  { month: 'Mar', revenue: 48000 },
  { month: 'Apr', revenue: 61000 },
  { month: 'May', revenue: 55000 },
  { month: 'Jun', revenue: 72000 },
  { month: 'Jul', revenue: 68000 },
];

const dailyBookings = [
  { day: 'Mon', bookings: 32 },
  { day: 'Tue', bookings: 45 },
  { day: 'Wed', bookings: 38 },
  { day: 'Thu', bookings: 52 },
  { day: 'Fri', bookings: 61 },
  { day: 'Sat', bookings: 74 },
  { day: 'Sun', bookings: 58 },
];

const recentActivity = [
  { id: '1', text: 'New SOS booking from Priya S.', type: 'sos', time: '2 min ago' },
  { id: '2', text: 'Driver Rajesh completed trip #4821', type: 'completed', time: '8 min ago' },
  { id: '3', text: 'Payment of ₹349 received', type: 'payment', time: '15 min ago' },
  { id: '4', text: 'New user registered: Amit P.', type: 'user', time: '32 min ago' },
  { id: '5', text: 'Driver Suresh went online', type: 'driver', time: '45 min ago' },
];

const kpiCards = [
  { label: 'Total Bookings', value: '2,847', change: '+12.5%', up: true, icon: CalendarCheck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { label: 'Total Users', value: '1,234', change: '+8.3%', up: true, icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { label: 'Revenue', value: formatCurrency(399000), change: '+15.2%', up: true, icon: IndianRupee, color: 'text-violet-500', bg: 'bg-violet-500/10' },
  { label: 'Active Jobs', value: '23', change: '-3', up: false, icon: Car, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { label: 'SOS Alerts', value: '4', change: '+2', up: true, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' },
  { label: 'Completion Rate', value: '94.2%', change: '+1.1%', up: true, icon: Activity, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
];

const INDIAN_NAMES = ['Aarav Patel', 'Priya Sharma', 'Rajesh Kumar', 'Deepa M.', 'Arun V.', 'Kavita Singh', 'Suresh Menon', 'Anjali D.'];
const CHENNAI_LOCATIONS = [
  { address: 'Anna Nagar, Chennai', lat: 13.0878, lng: 80.2206 },
  { address: 'T Nagar, Chennai', lat: 13.0418, lng: 80.2341 },
  { address: 'Velachery, Chennai', lat: 12.9716, lng: 80.2189 },
  { address: 'Adyar, Chennai', lat: 13.0012, lng: 80.2565 },
  { address: 'OMR, Chennai', lat: 12.9234, lng: 80.2301 },
  { address: 'Tambaram, Chennai', lat: 12.9249, lng: 80.1000 },
];

export default function AdminDashboard() {
  const [isSimulating, setIsSimulating] = useState(false);

  const triggerSimulation = async () => {
    setIsSimulating(true);
    toast.loading('Simulating live customer requests...', { id: 'sim' });
    
    // Generate 1-3 random requests
    const numRequests = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numRequests; i++) {
      const name = INDIAN_NAMES[Math.floor(Math.random() * INDIAN_NAMES.length)];
      const pickup = CHENNAI_LOCATIONS[Math.floor(Math.random() * CHENNAI_LOCATIONS.length)];
      let drop = CHENNAI_LOCATIONS[Math.floor(Math.random() * CHENNAI_LOCATIONS.length)];
      while (drop.address === pickup.address) {
        drop = CHENNAI_LOCATIONS[Math.floor(Math.random() * CHENNAI_LOCATIONS.length)];
      }

      const services: ServiceType[] = ['acting_driver', 'rental', 'mechanic', 'emergency'];
      const serviceType = services[Math.floor(Math.random() * services.length)];
      
      const isSOS = serviceType === 'emergency';
      
      const booking = {
        userId: `mock_user_${Math.floor(Math.random() * 10000)}`,
        userName: name,
        customerPhone: '+919876543210',
        driverId: null,
        serviceType: serviceType === 'emergency' ? 'acting_driver' : serviceType, // standardize
        status: 'requested' as const,
        pickup,
        drop: serviceType === 'mechanic' ? null : drop,
        amount: Math.floor(Math.random() * 500) + 150,
        paymentStatus: 'pending' as const,
        isSOS,
        priority: isSOS ? 'emergency' as const : 'normal' as const,
        rating: null,
        notes: isSOS ? 'EMERGENCY: Urgent help needed' : 'Please come fast',
        createdAt: new Date(),
        otp: Math.floor(100000 + Math.random() * 900000).toString(),
        city: 'Chennai'
      };

      try {
        const bookingId = await createBooking(booking);
        if (isSOS) {
          await createSOSRequest({
            customerId: booking.userId,
            bookingId,
            serviceType: 'SOS',
            location: pickup,
            status: 'searching',
            priority: 'high'
          });
        }
      } catch (e) {
        console.error('Error simulating booking:', e);
      }
    }

    toast.success(`Successfully dispatched ${numRequests} new live requests!`, { id: 'sim' });
    setIsSimulating(false);
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted mt-1">Welcome to RideRelief Admin Panel</p>
        </div>
        <button 
          onClick={triggerSimulation}
          disabled={isSimulating}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <Activity size={16} className={isSimulating ? "animate-spin" : ""} />
          {isSimulating ? "Simulating..." : "Simulate Live Traffic"}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
          >
            <Card variant="elevated" hoverable>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted">{kpi.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{kpi.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {kpi.up ? (
                      <ArrowUpRight className="text-emerald-500" size={14} />
                    ) : (
                      <ArrowDownRight className="text-red-500" size={14} />
                    )}
                    <span className={`text-xs font-medium ${kpi.up ? 'text-emerald-500' : 'text-red-500'}`}>
                      {kpi.change}
                    </span>
                    <span className="text-xs text-muted">vs last month</span>
                  </div>
                </div>
                <div className={`w-12 h-12 ${kpi.bg} rounded-xl flex items-center justify-center`}>
                  <kpi.icon className={kpi.color} size={22} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Trend */}
        <Card variant="elevated">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Revenue Trend</h3>
              <p className="text-xs text-muted">Monthly revenue overview</p>
            </div>
            <div className="flex items-center gap-1 text-emerald-500">
              <TrendingUp size={14} />
              <span className="text-xs font-medium">+15.2%</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" fill="url(#revGrad)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Daily Bookings */}
        <Card variant="elevated">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-foreground">Daily Bookings</h3>
              <p className="text-xs text-muted">This week&apos;s booking volume</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyBookings}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="bookings" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card variant="elevated">
        <h3 className="font-semibold text-foreground mb-4">Live Activity</h3>
        <div className="space-y-3">
          {recentActivity.map((a) => (
            <div key={a.id} className="flex items-center gap-3 py-2">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                a.type === 'sos' ? 'bg-red-500 animate-pulse' :
                a.type === 'completed' ? 'bg-emerald-500' :
                a.type === 'payment' ? 'bg-violet-500' :
                'bg-blue-500'
              }`} />
              <p className="text-sm text-foreground flex-1">{a.text}</p>
              <span className="text-xs text-muted whitespace-nowrap">{a.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
