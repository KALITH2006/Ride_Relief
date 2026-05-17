'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Car, Wrench, MapPin, RefreshCw, Filter } from 'lucide-react';
import GoogleMap, { type MapMarkerData } from '@/components/maps/GoogleMap';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import type { LiveLocation, SOSRequest } from '@/lib/types';
import { subscribeToAllOnlineProviders, subscribeToSOSRequests } from '@/lib/firestore';

// Demo providers for visualization
const demoProviders: LiveLocation[] = [
  { userId: 'd1', role: 'driver', lat: 12.9716, lng: 77.5946, heading: 45, speed: 35, updatedAt: new Date(), isOnline: true },
  { userId: 'd2', role: 'driver', lat: 12.9600, lng: 77.6100, heading: 120, speed: 25, updatedAt: new Date(), isOnline: true },
  { userId: 'd3', role: 'driver', lat: 12.9800, lng: 77.5800, heading: 200, speed: 40, updatedAt: new Date(), isOnline: true },
  { userId: 'm1', role: 'mechanic', lat: 12.9550, lng: 77.5700, heading: 0, speed: 0, updatedAt: new Date(), isOnline: true },
  { userId: 'm2', role: 'mechanic', lat: 12.9850, lng: 77.6050, heading: 90, speed: 15, updatedAt: new Date(), isOnline: true },
  { userId: 'r1', role: 'rental_car', lat: 12.9680, lng: 77.6200, heading: 0, speed: 0, updatedAt: new Date(), isOnline: true },
  { userId: 'r2', role: 'rental_car', lat: 12.9450, lng: 77.5850, heading: 0, speed: 0, updatedAt: new Date(), isOnline: true },
  { userId: 'c1', role: 'customer', lat: 12.9750, lng: 77.5980, heading: 0, speed: 0, updatedAt: new Date(), isOnline: true },
];

const ROLE_NAMES: Record<string, string> = {
  driver: 'Driver', mechanic: 'Mechanic', rental_car: 'Rental Car', customer: 'Customer',
};

type RoleFilter = 'all' | LiveLocation['role'];

export default function AdminMapPage() {
  const [providers, setProviders] = useState<LiveLocation[]>([]);
  const [sosCases, setSosCases] = useState<SOSRequest[]>([]);
  const [filter, setFilter] = useState<RoleFilter>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Subscribe to real-time Firestore data
  useEffect(() => {
    setIsRefreshing(true);
    const unsubProviders = subscribeToAllOnlineProviders((data) => {
      setProviders(data);
      setIsRefreshing(false);
    });

    const unsubSOS = subscribeToSOSRequests((data) => {
      setSosCases(data);
    });

    return () => {
      unsubProviders();
      unsubSOS();
    };
  }, []);

  const filtered = filter === 'all' ? providers : providers.filter((p) => p.role === filter);

  const markers: MapMarkerData[] = filtered.map((p) => ({
    id: p.userId,
    position: { lat: p.lat, lng: p.lng },
    title: `${ROLE_NAMES[p.role] || 'Unknown'} ${p.userId}`,
    role: p.role,
    heading: p.heading,
    info: `Speed: ${p.speed?.toFixed(0) || 0} km/h • Updated: ${p.updatedAt.toLocaleTimeString()}`,
  }));

  // Add SOS Markers
  if (filter === 'all' || filter === 'customer') {
    sosCases.forEach((sos) => {
      markers.push({
        id: `sos-${sos.id || sos.customerId}`,
        position: { lat: sos.location.lat, lng: sos.location.lng },
        title: `SOS EMERGENCY`,
        role: 'sos',
        info: `High Priority • Assigned: ${sos.status === 'assigned'}`,
      });
    });
  }

  const counts = {
    all: providers.length,
    driver: providers.filter((p) => p.role === 'driver').length,
    mechanic: providers.filter((p) => p.role === 'mechanic').length,
    rental_car: providers.filter((p) => p.role === 'rental_car').length,
    customer: providers.filter((p) => p.role === 'customer').length,
  };

  const filterButtons: { key: RoleFilter; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'all', label: 'All', icon: <Users size={14} />, color: 'text-foreground' },
    { key: 'driver', label: 'Drivers', icon: <Car size={14} />, color: 'text-blue-500' },
    { key: 'mechanic', label: 'Mechanics', icon: <Wrench size={14} />, color: 'text-amber-500' },
    { key: 'rental_car', label: 'Rentals', icon: <Car size={14} />, color: 'text-emerald-500' },
    { key: 'customer', label: 'Customers', icon: <MapPin size={14} />, color: 'text-violet-500' },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Live Map</h1>
          <p className="text-sm text-muted mt-1">Real-time location of all providers & customers</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} /> Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {filterButtons.map((fb) => (
          <motion.div key={fb.key} whileTap={{ scale: 0.97 }}>
            <Card hoverable onClick={() => setFilter(fb.key)}
              className={`cursor-pointer transition-all ${filter === fb.key ? 'ring-2 ring-primary' : ''}`}>
              <div className="flex items-center gap-2">
                <span className={fb.color}>{fb.icon}</span>
                <div>
                  <p className="text-xs text-muted">{fb.label}</p>
                  <p className="text-lg font-bold text-foreground">{counts[fb.key]}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Map */}
      <Card variant="elevated" className="p-0 overflow-hidden">
        <GoogleMap
          markers={markers}
          fitMarkers
          height="550px"
          center={{ lat: 12.9716, lng: 77.5946 }}
          zoom={13}
        />
      </Card>

      {/* Provider List */}
      <Card variant="elevated">
        <h3 className="font-semibold text-foreground mb-3">Active Providers ({filtered.length})</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filtered.map((p) => (
            <div key={p.userId} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-border/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${p.isOnline ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                <div>
                  <p className="text-sm font-medium text-foreground">{ROLE_NAMES[p.role]} {p.userId}</p>
                  <p className="text-xs text-muted">{p.lat.toFixed(4)}, {p.lng.toFixed(4)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted">{p.speed?.toFixed(0) || 0} km/h</p>
                <p className="text-[10px] text-muted">{p.updatedAt.toLocaleTimeString()}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
