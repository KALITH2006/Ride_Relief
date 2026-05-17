'use client';

import { useState } from 'react';
import { IndianRupee, TrendingUp, Car, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const weeklyData = [
  { day: 'Mon', earnings: 820 },
  { day: 'Tue', earnings: 1240 },
  { day: 'Wed', earnings: 950 },
  { day: 'Thu', earnings: 1420 },
  { day: 'Fri', earnings: 1890 },
  { day: 'Sat', earnings: 2100 },
  { day: 'Sun', earnings: 1560 },
];

const payouts = [
  { id: '1', amount: 4500, date: '27 Apr 2024', status: 'completed' },
  { id: '2', amount: 3800, date: '20 Apr 2024', status: 'completed' },
  { id: '3', amount: 5200, date: '13 Apr 2024', status: 'completed' },
];

export default function EarningsPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Earnings</h2>
        <p className="text-sm text-muted">Track your income</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card variant="gradient">
            <p className="text-xs text-muted mb-1">This Week</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(9980)}</p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="text-emerald-500" size={12} />
              <span className="text-xs text-emerald-500 font-medium">+12.5%</span>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Card variant="gradient">
            <p className="text-xs text-muted mb-1">This Month</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(38450)}</p>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="text-emerald-500" size={12} />
              <span className="text-xs text-emerald-500 font-medium">+8.3%</span>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <Car className="text-primary" size={14} />
              <p className="text-xs text-muted">Total Trips</p>
            </div>
            <p className="text-xl font-bold text-foreground">245</p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="text-emerald-500" size={14} />
              <p className="text-xs text-muted">Avg/Trip</p>
            </div>
            <p className="text-xl font-bold text-foreground">{formatCurrency(285)}</p>
          </Card>
        </motion.div>
      </div>

      {/* Chart */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Weekly Earnings</h3>
          <div className="flex gap-1">
            {(['daily', 'weekly', 'monthly'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  period === p ? 'bg-primary/10 text-primary' : 'text-muted'
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyData}>
              <defs>
                <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--muted)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="earnings" stroke="#2563eb" fill="url(#earningsGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Payout History */}
      <Card>
        <h3 className="font-semibold text-foreground mb-3">Payout History</h3>
        <div className="space-y-3">
          {payouts.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <IndianRupee className="text-emerald-500" size={14} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Payout</p>
                  <p className="text-xs text-muted">{p.date}</p>
                </div>
              </div>
              <p className="font-bold text-emerald-500">{formatCurrency(p.amount)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
