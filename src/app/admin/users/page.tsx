'use client';

import { useState } from 'react';
import { Search, UserPlus, Shield, Car, Ban } from 'lucide-react';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const demoUsers = [
  { uid: '1', name: 'Priya Sharma', email: 'priya@example.com', phone: '+91 99876 54321', role: 'customer', trips: 12, joined: new Date('2024-01-15') },
  { uid: '2', name: 'Amit Patel', email: 'amit@example.com', phone: '+91 98765 12345', role: 'customer', trips: 8, joined: new Date('2024-02-20') },
  { uid: '3', name: 'Rajesh Kumar', email: 'rajesh@example.com', phone: '+91 97654 32100', role: 'driver', trips: 245, joined: new Date('2023-12-01') },
  { uid: '4', name: 'Suresh Menon', email: 'suresh@example.com', phone: '+91 96543 21000', role: 'driver', trips: 182, joined: new Date('2024-01-10') },
  { uid: '5', name: 'Sneha Reddy', email: 'sneha@example.com', phone: '+91 95432 10900', role: 'customer', trips: 24, joined: new Date('2024-03-05') },
  { uid: '6', name: 'Admin User', email: 'admin@riderelief.com', phone: '+91 94321 09800', role: 'admin', trips: 0, joined: new Date('2023-11-01') },
];

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filtered = demoUsers.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const roleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield size={12} />;
      case 'driver': return <Car size={12} />;
      default: return null;
    }
  };

  const handleAddUser = () => {
    toast.success('Opening Add User modal...');
  };

  const handleView = () => {
    toast('Opening user details...', { icon: '👁️' });
  };

  const handleDisable = () => {
    toast.error('User disabled.');
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users</h1>
          <p className="text-sm text-muted mt-1">Manage platform users</p>
        </div>
        <Button size="sm" onClick={handleAddUser}>
          <UserPlus size={14} /> Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            id="admin-search-users"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={16} />}
          />
        </div>
        <div className="flex gap-2">
          {['all', 'customer', 'driver', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                roleFilter === r ? 'gradient-primary text-white' : 'bg-surface border border-border text-muted'
              }`}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}s
            </button>
          ))}
        </div>
      </div>

      {/* User Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((user) => (
          <Card key={user.uid} variant="elevated" hoverable>
            <div className="flex items-start gap-3 mb-3">
              <Avatar name={user.name} size="lg" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{user.name}</h3>
                <p className="text-xs text-muted truncate">{user.email}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Badge label={user.role.charAt(0).toUpperCase() + user.role.slice(1)} size="sm" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center py-2 border-y border-border mb-3">
              <div>
                <p className="text-lg font-bold text-foreground">{user.trips}</p>
                <p className="text-[10px] text-muted">Trips</p>
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">{formatDate(user.joined)}</p>
                <p className="text-[10px] text-muted">Joined</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="flex-1 text-xs" onClick={handleView}>
                View
              </Button>
              <Button variant="ghost" size="sm" className="flex-1 text-xs text-danger hover:bg-danger/10" onClick={handleDisable}>
                <Ban size={12} /> Disable
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
