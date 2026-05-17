'use client';

import Card from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import {
  ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
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

const peakHoursData = [
  { hour: '6AM', bookings: 5 },
  { hour: '8AM', bookings: 28 },
  { hour: '10AM', bookings: 22 },
  { hour: '12PM', bookings: 35 },
  { hour: '2PM', bookings: 18 },
  { hour: '4PM', bookings: 15 },
  { hour: '6PM', bookings: 42 },
  { hour: '8PM', bookings: 38 },
  { hour: '10PM', bookings: 20 },
  { hour: '12AM', bookings: 8 },
];

const serviceData = [
  { name: 'Acting Driver', value: 45, color: '#3b82f6' },
  { name: 'Rental', value: 25, color: '#10b981' },
  { name: 'Mechanic', value: 18, color: '#f59e0b' },
  { name: 'Emergency', value: 12, color: '#ef4444' },
];

const driverRatings = [
  { name: 'Rajesh K.', rating: 4.9, trips: 245 },
  { name: 'Suresh M.', rating: 4.8, trips: 182 },
  { name: 'Manoj P.', rating: 4.7, trips: 156 },
  { name: 'Dev S.', rating: 4.6, trips: 134 },
  { name: 'Kiran R.', rating: 4.5, trips: 98 },
];

const cancellationData = [
  { month: 'Jan', rate: 8.2 },
  { month: 'Feb', rate: 7.5 },
  { month: 'Mar', rate: 6.8 },
  { month: 'Apr', rate: 5.4 },
  { month: 'May', rate: 6.1 },
  { month: 'Jun', rate: 4.9 },
  { month: 'Jul', rate: 5.8 },
];

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted mt-1">Deep insights into platform performance</p>
      </div>

      {/* Row 1: Revenue + Services */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card variant="elevated" className="lg:col-span-2">
          <h3 className="font-semibold text-foreground mb-4">Revenue Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revGradAnalytics" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" fill="url(#revGradAnalytics)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card variant="elevated">
          <h3 className="font-semibold text-foreground mb-4">Popular Services</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={serviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={45}>
                  {serviceData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {serviceData.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: s.color }} />
                  <span className="text-muted">{s.name}</span>
                </div>
                <span className="font-medium text-foreground">{s.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 2: Peak Hours + Driver Ratings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card variant="elevated">
          <h3 className="font-semibold text-foreground mb-4">Peak Hours</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHoursData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="hour" tick={{ fontSize: 10, fill: 'var(--muted)' }} axisLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
                <Bar dataKey="bookings" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card variant="elevated">
          <h3 className="font-semibold text-foreground mb-4">Top Driver Ratings</h3>
          <div className="space-y-3">
            {driverRatings.map((d, i) => (
              <div key={d.name} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{d.name}</p>
                    <div className="flex items-center gap-1">
                      <span className="text-amber-500">⭐</span>
                      <span className="text-sm font-bold text-foreground">{d.rating}</span>
                    </div>
                  </div>
                  <div className="mt-1 h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full gradient-primary rounded-full transition-all"
                      style={{ width: `${(d.rating / 5) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted mt-0.5">{d.trips} trips completed</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Row 3: Cancellation Rate */}
      <Card variant="elevated">
        <h3 className="font-semibold text-foreground mb-4">Cancellation Rate Trend</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cancellationData}>
              <defs>
                <linearGradient id="cancelGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} unit="%" />
              <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border-color)', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="rate" stroke="#ef4444" fill="url(#cancelGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
