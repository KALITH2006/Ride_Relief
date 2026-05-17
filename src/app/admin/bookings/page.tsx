'use client';

import { useState } from 'react';
import { Search, Filter, Trash2, UserPlus, Download, Eye } from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { SERVICE_LABELS, type BookingStatus, type ServiceType } from '@/lib/types';
import toast from 'react-hot-toast';

interface DemoBooking {
  id: string;
  customer: string;
  driver: string | null;
  service: ServiceType;
  status: BookingStatus;
  amount: number;
  isSOS: boolean;
  pickup: string;
  date: Date;
}

const demoBookings: DemoBooking[] = [
  { id: 'BK001', customer: 'Priya Sharma', driver: 'Rajesh K.', service: 'acting_driver', status: 'completed', amount: 349, isSOS: false, pickup: 'MG Road, Bangalore', date: new Date() },
  { id: 'BK002', customer: 'Amit Patel', driver: null, service: 'emergency', status: 'requested', amount: 0, isSOS: true, pickup: 'Koramangala, Bangalore', date: new Date(Date.now() - 300000) },
  { id: 'BK003', customer: 'Sneha Reddy', driver: 'Suresh M.', service: 'acting_driver', status: 'on_the_way', amount: 425, isSOS: false, pickup: 'HSR Layout, Bangalore', date: new Date(Date.now() - 1800000) },
  { id: 'BK004', customer: 'Vikram Singh', driver: 'Manoj P.', service: 'mechanic', status: 'assigned', amount: 199, isSOS: false, pickup: 'Whitefield, Bangalore', date: new Date(Date.now() - 3600000) },
  { id: 'BK005', customer: 'Anita Gupta', driver: null, service: 'rental', status: 'requested', amount: 599, isSOS: false, pickup: 'Jayanagar, Bangalore', date: new Date(Date.now() - 7200000) },
  { id: 'BK006', customer: 'Ravi Kumar', driver: 'Dev S.', service: 'emergency', status: 'arrived', amount: 299, isSOS: true, pickup: 'Electronic City, Bangalore', date: new Date(Date.now() - 10800000) },
];

export default function AdminBookingsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [bookings, setBookings] = useState(demoBookings);

  const filtered = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (search && !b.customer.toLowerCase().includes(search.toLowerCase()) && !b.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleDelete = (id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
    toast.success('Booking deleted');
  };

  const handleExport = () => {
    toast.success('Exporting bookings to CSV...');
  };

  const handleAssign = () => {
    toast('Assigning driver feature coming soon.', { icon: '🚗' });
  };

  const handleView = () => {
    toast('Opening booking details...', { icon: '👁️' });
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bookings</h1>
          <p className="text-sm text-muted mt-1">Manage all bookings</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download size={14} /> Export
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            id="admin-search-bookings"
            placeholder="Search by customer or booking ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={16} />}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {(['all', 'requested', 'assigned', 'on_the_way', 'completed', 'cancelled'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === s ? 'gradient-primary text-white' : 'bg-surface border border-border text-muted'
              }`}
            >
              {s === 'all' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card variant="elevated" className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-semibold text-muted py-3 px-4">ID</th>
                <th className="text-left text-xs font-semibold text-muted py-3 px-4">Customer</th>
                <th className="text-left text-xs font-semibold text-muted py-3 px-4">Service</th>
                <th className="text-left text-xs font-semibold text-muted py-3 px-4">Driver</th>
                <th className="text-left text-xs font-semibold text-muted py-3 px-4">Status</th>
                <th className="text-left text-xs font-semibold text-muted py-3 px-4">Amount</th>
                <th className="text-left text-xs font-semibold text-muted py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className={`border-b border-border/50 hover:bg-border/20 transition-colors ${b.isSOS ? 'bg-red-500/5' : ''}`}>
                  <td className="py-3 px-4">
                    <span className="text-xs font-mono text-muted">{b.id}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">{b.customer}</p>
                      <p className="text-xs text-muted">{b.pickup}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-foreground">{SERVICE_LABELS[b.service]}</span>
                  </td>
                  <td className="py-3 px-4">
                    {b.driver ? (
                      <span className="text-sm text-foreground">{b.driver}</span>
                    ) : (
                      <button className="flex items-center gap-1 text-xs text-primary hover:underline" onClick={handleAssign}>
                        <UserPlus size={12} /> Assign
                      </button>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Badge status={b.isSOS ? 'sos' : b.status} />
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-semibold text-foreground">{formatCurrency(b.amount)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-border/50 text-muted hover:text-primary transition-colors" onClick={handleView}>
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-muted">No bookings found</p>
          </div>
        )}
      </Card>
    </div>
  );
}
