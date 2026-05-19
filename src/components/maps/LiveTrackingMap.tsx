'use client';

import { useState, useEffect } from 'react';
import { Phone, Navigation, Clock, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import LeafletMap, { type MapMarkerData } from '@/components/maps/LeafletMap';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useLocationStore } from '@/stores/locationStore';
import { useAuthStore } from '@/stores/authStore';
import { useTrackingStore } from '@/stores/trackingStore';
import { predictETA } from '@/lib/etaPrediction';
import type { LiveLocation, BookingStatus, TrackingRoom } from '@/lib/types';

interface LiveTrackingMapProps {
  bookingId: string;
  driverId: string;
  driverName: string;
  driverPhone?: string;
  customerLocation: { lat: number; lng: number };
  pickupAddress: string;
  dropAddress?: string;
  dropLocation?: { lat: number; lng: number };
  status: BookingStatus;
  serviceType: string;
  trackingRoom: TrackingRoom | null;
}

export default function LiveTrackingMap({
  bookingId, driverId, driverName, driverPhone,
  customerLocation, pickupAddress, dropAddress, dropLocation, status, serviceType, trackingRoom
}: LiveTrackingMapProps) {
  const { trackUser } = useLocationStore();
  const { profile } = useAuthStore();
  const { updateETA } = useTrackingStore();
  const [driverLocation, setDriverLocation] = useState<LiveLocation | null>(null);
  const [eta, setEta] = useState<number | null>(null);
  const [distance, setDistance] = useState<string | null>(null);

  useEffect(() => {
    if (!driverId) return;
    const unsubscribe = trackUser(driverId, (location) => {
      setDriverLocation(location);
    });
    return () => unsubscribe();
  }, [driverId, trackUser]);

  // Use TrackingRoom data if available, fallback to local distance calc
  const finalDriverLocation = trackingRoom?.providerLocation || driverLocation;
  
  useEffect(() => {
    if (trackingRoom?.eta) {
      setEta(parseInt(trackingRoom.eta));
      setDistance(trackingRoom.distance || null);
    } else if (finalDriverLocation) {
      const dist = haversineDistance(finalDriverLocation.lat, finalDriverLocation.lng, customerLocation.lat, customerLocation.lng);
      setDistance(dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`);
      setEta(Math.max(1, Math.round(dist * 2.5)));
    }
  }, [trackingRoom, finalDriverLocation, customerLocation]);

  // OSRM route callback
  const handleRouteCalculated = (distText: string, durText: string, distValue: number, durValue: number, polyline: string) => {
    if (profile?.role === 'driver' && status !== 'completed') {
      const distanceKm = distValue / 1000;
      const etaObj = predictETA({
        distanceKm,
        weatherCondition: 'clear',
        trafficLevel: 'moderate',
        timeOfDay: new Date().getHours()
      });
      
      const newEta = etaObj.minutes.toString();
      setEta(etaObj.minutes);
      setDistance(distText);
      updateETA(newEta, distText, polyline);
    }
  };

  const markers: MapMarkerData[] = [
    {
      id: 'customer',
      position: customerLocation,
      title: 'Your Location',
      role: 'pickup',
      info: pickupAddress,
    },
  ];

  if (finalDriverLocation) {
    const roleLabel = serviceType === 'mechanic' ? 'mechanic' : serviceType === 'rental' ? 'rental_car' : 'driver';
    markers.push({
      id: 'driver',
      position: { lat: finalDriverLocation.lat, lng: finalDriverLocation.lng },
      title: driverName,
      role: roleLabel as MapMarkerData['role'],
      heading: driverLocation?.heading || 0,
      info: `${driverName} • ${distance || 'Calculating...'}`,
    });
  }

  if (dropLocation && dropAddress) {
    markers.push({
      id: 'drop',
      position: dropLocation,
      title: 'Drop-off',
      role: 'drop',
      info: dropAddress,
    });
  }

  const statusTimeline = [
    { key: 'assigned', label: 'Assigned', done: ['assigned', 'on_the_way', 'arrived', 'completed'].includes(status) },
    { key: 'on_the_way', label: 'On the Way', done: ['on_the_way', 'arrived', 'completed'].includes(status) },
    { key: 'arrived', label: 'Arrived', done: ['arrived', 'completed'].includes(status) },
    { key: 'completed', label: 'Completed', done: status === 'completed' },
  ];

  return (
    <div className="space-y-4">
      {/* Map */}
      <div className="relative">
        <LeafletMap
          markers={markers}
          fitMarkers={markers.length > 1}
          height="350px"
          showRoute={!!finalDriverLocation}
          routeOrigin={finalDriverLocation ? { lat: finalDriverLocation.lat, lng: finalDriverLocation.lng } : undefined}
          routeDestination={customerLocation}
          onRouteCalculated={handleRouteCalculated}
          className="rounded-2xl overflow-hidden"
        />
        {/* ETA Overlay */}
        {eta !== null && status !== 'completed' && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="absolute top-3 left-3 glass rounded-xl px-4 py-2" style={{ zIndex: 1000 }}>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-primary" />
              <div>
                <p className="text-lg font-bold text-foreground">{eta} min</p>
                <p className="text-[10px] text-muted">ETA • {distance}</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Driver Info Card */}
      <Card variant="elevated">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-lg">
              {driverName.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-foreground">{driverName}</p>
              <p className="text-xs text-muted">{serviceType === 'mechanic' ? 'Mechanic' : serviceType === 'rental' ? 'Rental Car' : 'Driver'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {driverPhone && (
              <a href={`tel:${driverPhone}`}>
                <Button variant="outline" size="sm"><Phone size={14} /></Button>
              </a>
            )}
            {finalDriverLocation && (
              <a href={`https://www.openstreetmap.org/directions?engine=osrm_car&route=${finalDriverLocation.lat},${finalDriverLocation.lng};${customerLocation.lat},${customerLocation.lng}`} target="_blank" rel="noopener noreferrer">
                <Button size="sm"><Navigation size={14} /> Navigate</Button>
              </a>
            )}
          </div>
        </div>
      </Card>

      {/* Status Timeline */}
      <Card>
        <h3 className="font-semibold text-foreground text-sm mb-3">Trip Status</h3>
        <div className="flex items-center gap-1">
          {statusTimeline.map((step, i) => (
            <div key={step.key} className="flex items-center flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step.done ? 'gradient-primary text-white' : 'bg-border text-muted'}`}>
                {i + 1}
              </div>
              {i < statusTimeline.length - 1 && (
                <div className={`flex-1 h-1 mx-1 rounded-full transition-all ${step.done ? 'gradient-primary' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          {statusTimeline.map((step) => (
            <p key={step.key} className={`text-[9px] text-center flex-1 ${step.done ? 'text-primary font-medium' : 'text-muted'}`}>{step.label}</p>
          ))}
        </div>
      </Card>
    </div>
  );
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
