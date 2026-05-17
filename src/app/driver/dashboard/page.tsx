'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Wifi, WifiOff, Car, MapPin, Clock, IndianRupee,
  CheckCircle, XCircle, Navigation, Phone, ChevronRight, Lock
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useLocationStore } from '@/stores/locationStore';
import { useGeolocation } from '@/hooks/useGeolocation';
import GoogleMap, { type MapMarkerData } from '@/components/maps/GoogleMap';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

// Demo incoming jobs
const demoJobs = [
  {
    id: 'j1', customerName: 'Priya Sharma', customerPhone: '+91 99876 54321',
    serviceType: 'acting_driver', pickup: { address: '12th Main, Indiranagar, Bangalore', lat: 12.97, lng: 77.64 },
    drop: { address: 'Whitefield, Bangalore', lat: 12.97, lng: 77.75 }, distance: 14.2, estimatedFare: 349, isSOS: false,
  },
  {
    id: 'j2', customerName: 'Amit Patel', customerPhone: '+91 98765 12345',
    serviceType: 'emergency', pickup: { address: 'Koramangala 4th Block, Bangalore', lat: 12.93, lng: 77.62 },
    drop: null, distance: 3.5, estimatedFare: 199, isSOS: true,
  },
];

export default function DriverDashboard() {
  const { profile, updateProfile } = useAuthStore();
  const { myLocation, startTracking, stopTracking, isTracking, setMyLocation } = useLocationStore();
  const [isOnline, setIsOnline] = useState(false);
  const [activeJob, setActiveJob] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<string>('');
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState(false);
  
  // Fetch accurate location immediately
  const { latitude, longitude } = useGeolocation(true);
  useEffect(() => {
    if (latitude && longitude) {
      setMyLocation(latitude, longitude);
    }
  }, [latitude, longitude, setMyLocation]);

  const toggleOnline = () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus);
    updateProfile({ isOnline: newStatus });
    if (newStatus && profile) {
      startTracking(profile.uid, 'driver');
    } else {
      stopTracking();
    }
    toast(newStatus ? '🟢 You are now Online' : '🔴 You are now Offline');
  };

  // Stop tracking on unmount
  useEffect(() => { return () => { stopTracking(); }; }, [stopTracking]);

  const acceptJob = (jobId: string) => {
    setActiveJob(jobId);
    setJobStatus('assigned');
    toast.success('Job accepted! Navigate to customer.');
  };

  const updateJobStatus = (status: string) => {
    if (status === 'completed') {
      if (otpInput.length !== 6) {
        setOtpError(true);
        toast.error('Please enter a valid 6-digit OTP from the customer');
        return;
      }
      // Real app: await verifyOTP(activeJob, otpInput);
      setOtpError(false);
      toast.success('OTP Verified & Job completed! 🎉');
      setActiveJob(null);
      setJobStatus('');
      setOtpInput('');
    } else {
      setJobStatus(status);
      toast(`Status updated: ${status.replace('_', ' ')}`);
    }
  };

  const declineJob = () => { toast('Job declined.', { icon: '✖️' }); };

  const todayEarnings = 1240;
  const todayTrips = 5;

  // Build map markers
  const mapMarkers: MapMarkerData[] = [];
  if (myLocation) {
    mapMarkers.push({ id: 'me', position: myLocation, title: 'Your Location', role: 'driver', info: 'You are here' });
  }
  if (isOnline && !activeJob) {
    demoJobs.forEach((job) => {
      mapMarkers.push({
        id: job.id, position: { lat: job.pickup.lat, lng: job.pickup.lng },
        title: job.customerName, role: job.isSOS ? 'sos' : 'customer',
        info: `${job.pickup.address} • ${job.distance}km`,
      });
    });
  }
  if (activeJob) {
    const job = demoJobs.find((j) => j.id === activeJob);
    if (job) {
      mapMarkers.push({
        id: 'customer-active', position: { lat: job.pickup.lat, lng: job.pickup.lng },
        title: job.customerName, role: job.isSOS ? 'sos' : 'customer', info: job.pickup.address,
      });
    }
  }

  return (
    <div className="px-4 py-5 max-w-lg mx-auto space-y-5">
      {/* Online/Offline Toggle */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <Card variant="elevated" className={`${isOnline ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isOnline ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                {isOnline ? <Wifi className="text-emerald-500" size={22} /> : <WifiOff className="text-red-500" size={22} />}
              </div>
              <div>
                <h2 className="font-bold text-foreground text-lg">{isOnline ? 'You\'re Online' : 'You\'re Offline'}</h2>
                <p className="text-xs text-muted">{isOnline ? 'Receiving job requests • GPS active' : 'Tap to start receiving jobs'}</p>
              </div>
            </div>
            <button onClick={toggleOnline} className={`w-14 h-7 rounded-full transition-all duration-300 relative ${isOnline ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
              <div className={`w-6 h-6 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform duration-300 ${isOnline ? 'translate-x-7' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </Card>
      </motion.div>

      {/* Live Map */}
      {isOnline && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <GoogleMap
            center={myLocation || { lat: 12.9716, lng: 77.5946 }}
            markers={mapMarkers}
            fitMarkers={mapMarkers.length > 1}
            height="250px"
            zoom={13}
            showRoute={!!activeJob && mapMarkers.length > 1}
            routeOrigin={myLocation || undefined}
            routeDestination={activeJob ? (() => { const j = demoJobs.find((jj) => jj.id === activeJob); return j ? { lat: j.pickup.lat, lng: j.pickup.lng } : undefined; })() : undefined}
            className="rounded-2xl"
          />
        </motion.div>
      )}

      {/* Today's Summary */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card variant="gradient">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><IndianRupee className="text-primary" size={18} /></div>
              <div><p className="text-xs text-muted">Today&apos;s Earnings</p><p className="text-xl font-bold text-foreground">{formatCurrency(todayEarnings)}</p></div>
            </div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card variant="gradient">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center"><Car className="text-emerald-500" size={18} /></div>
              <div><p className="text-xs text-muted">Trips Today</p><p className="text-xl font-bold text-foreground">{todayTrips}</p></div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Active Job */}
      {activeJob && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card variant="elevated" className="border-primary/30">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <h3 className="font-semibold text-foreground">Active Job</h3>
              <Badge status={jobStatus === 'assigned' ? 'assigned' : jobStatus === 'on_the_way' ? 'on_the_way' : 'arrived'} />
            </div>
            
            {activeJob && (() => {
              const job = demoJobs.find(j => j.id === activeJob);
              return job && (
                <div className="mb-3 space-y-1">
                  <p className="text-xs text-muted font-mono">ID: {job.id.toUpperCase()}</p>
                  <p className="text-sm font-medium text-foreground">{job.serviceType === 'acting_driver' ? 'Acting Driver' : job.serviceType === 'emergency' ? 'Emergency SOS' : job.serviceType}</p>
                  <div className="flex items-center gap-1 text-xs text-muted mt-1"><MapPin size={12}/> {job.pickup.address}</div>
                </div>
              );
            })()}

            {jobStatus === 'arrived' && (
              <div className="mb-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                <label className="text-xs text-muted flex items-center gap-1 mb-1.5"><Lock size={12}/> Customer OTP required</label>
                <input 
                  type="text" 
                  maxLength={6}
                  placeholder="Enter 6-digit OTP" 
                  value={otpInput}
                  onChange={(e) => { setOtpInput(e.target.value); setOtpError(false); }}
                  className={`w-full bg-surface border ${otpError ? 'border-red-500' : 'border-border'} rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none transition-all`}
                />
              </div>
            )}

            <div className="flex gap-2 mt-3">
              {jobStatus === 'assigned' && (<Button size="sm" className="flex-1" onClick={() => updateJobStatus('on_the_way')}><Navigation size={14} /> Start Trip</Button>)}
              {jobStatus === 'on_the_way' && (<Button size="sm" className="flex-1" onClick={() => updateJobStatus('arrived')}><MapPin size={14} /> Arrived</Button>)}
              {jobStatus === 'arrived' && (<Button variant="secondary" size="sm" className="flex-1" onClick={() => updateJobStatus('completed')}><CheckCircle size={14} /> Verify & Complete</Button>)}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Incoming Requests */}
      {isOnline && !activeJob && (
        <div>
          <h3 className="text-lg font-bold text-foreground mb-3">Incoming Requests</h3>
          <div className="space-y-3">
            {demoJobs.map((job) => (
              <motion.div key={job.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <Card variant="elevated" className={job.isSOS ? 'border-red-500/50 bg-red-500/5' : ''}>
                  {job.isSOS && (<div className="flex items-center gap-1 mb-2"><Badge status="sos" size="md" /></div>)}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">#</div>
                      <div>
                        <p className="font-mono font-semibold text-foreground text-sm uppercase">{job.id}</p>
                        <p className="text-xs text-muted">{job.distance} km away • {Math.round(job.distance * 2.5)} min ETA</p>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-primary">{formatCurrency(job.estimatedFare)}</p>
                  </div>
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center gap-2 text-xs"><div className="w-2 h-2 rounded-full bg-emerald-500" /><span className="text-muted">{job.pickup.address}</span></div>
                    {job.drop && (<div className="flex items-center gap-2 text-xs"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-muted">{job.drop.address}</span></div>)}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="danger" size="sm" className="flex-1" onClick={declineJob}><XCircle size={14} /> Decline</Button>
                    <Button size="sm" className="flex-1" onClick={() => acceptJob(job.id)}><CheckCircle size={14} /> Accept</Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Offline Message */}
      {!isOnline && (
        <Card className="text-center py-8">
          <WifiOff className="mx-auto text-muted mb-3" size={40} />
          <h3 className="font-semibold text-foreground">You&apos;re Offline</h3>
          <p className="text-sm text-muted mt-1">Go online to start receiving job requests</p>
        </Card>
      )}
    </div>
  );
}
