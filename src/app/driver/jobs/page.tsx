'use client';

import { useState } from 'react';
import { Car, Filter, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { SERVICE_LABELS, type BookingStatus,  type ServiceType } from '@/lib/types';

const demoJobs = [
  { id: '1', customer: 'Priya Sharma', service: 'acting_driver' as ServiceType, pickup: 'MG Road, Bangalore', status: 'completed' as BookingStatus, amount: 349, date: new Date(Date.now() - 3600000) },
  { id: '2', customer: 'Amit Patel', service: 'emergency' as ServiceType, pickup: 'Koramangala, Bangalore', status: 'completed' as BookingStatus, amount: 199, date: new Date(Date.now() - 86400000), isSOS: true },
  { id: '3', customer: 'Sneha Reddy', service: 'acting_driver' as ServiceType, pickup: 'HSR Layout, Bangalore', status: 'completed' as BookingStatus, amount: 425, date: new Date(Date.now() - 172800000) },
  { id: '4', customer: 'Vikram Singh', service: 'rental' as ServiceType, pickup: 'Whitefield, Bangalore', status: 'cancelled' as BookingStatus, amount: 0, date: new Date(Date.now() - 259200000) },
];

export default function DriverJobsPage() {
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled'>('all');

  const filtered = demoJobs.filter(j => filter === 'all' || j.status === filter);

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Job History</h2>
        <p className="text-sm text-muted">Your completed and past jobs</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'completed', 'cancelled'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              filter === f ? 'gradient-primary text-white' : 'bg-surface border border-border text-muted'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Jobs List */}
      {filtered.length === 0 ? (
        <Card className="text-center py-12">
          <Calendar className="mx-auto text-muted mb-3" size={40} />
          <h3 className="font-semibold text-foreground">No jobs found</h3>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((job, i) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              <Card hoverable>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Car className="text-primary" size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{job.customer}</p>
                      <p className="text-xs text-muted">{SERVICE_LABELS[job.service]}</p>
                    </div>
                  </div>
                  <Badge status={(job as any).isSOS ? 'sos' : job.status} />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  {job.pickup}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-xs text-muted">{formatDate(job.date)}</span>
                  <span className="font-bold text-primary text-sm">{formatCurrency(job.amount)}</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
