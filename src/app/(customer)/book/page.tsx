'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car, Shield, Wrench, Phone, MapPin, Navigation,
  ChevronLeft, ChevronRight, CreditCard, CheckCircle
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useBookingStore } from '@/stores/bookingStore';
import { useGeolocation } from '@/hooks/useGeolocation';
import GoogleMap, { type MapMarkerData } from '@/components/maps/GoogleMap';
import LocationAutocomplete from '@/components/maps/LocationAutocomplete';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';
import type { ServiceType, Location } from '@/lib/types';
import toast from 'react-hot-toast';

const services = [
  { type: 'acting_driver' as ServiceType, label: 'Acting Driver', icon: Car, color: 'from-blue-500 to-blue-600', desc: 'A professional driver for your vehicle' },
  { type: 'rental' as ServiceType, label: 'Rental Vehicle', icon: Shield, color: 'from-emerald-500 to-emerald-600', desc: 'Rent a car, bike, or SUV' },
  { type: 'mechanic' as ServiceType, label: 'Mechanic', icon: Wrench, color: 'from-amber-500 to-amber-600', desc: 'On-spot vehicle repair' },
  { type: 'emergency' as ServiceType, label: 'Emergency', icon: Phone, color: 'from-red-500 to-red-600', desc: 'Immediate roadside assistance' },
];

type Step = 'service' | 'location' | 'confirm' | 'success';

function BookingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile } = useAuthStore();
  const { setServiceType, setPickup, setDrop, serviceType, pickup, drop, estimatedFare, priceBreakdown, confirmBooking, isBooking } = useBookingStore();
  const { latitude, longitude } = useGeolocation();

  const [step, setStep] = useState<Step>('service');
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropAddress, setDropAddress] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [dropLocation, setDropLocation] = useState<Location | null>(null);

  // Auto-select service from URL params
  useEffect(() => {
    const service = searchParams.get('service') as ServiceType;
    if (service && services.some(s => s.type === service)) {
      setServiceType(service);
      setStep('location');
    }
  }, [searchParams, setServiceType]);

  const handleServiceSelect = (type: ServiceType) => {
    setServiceType(type);
    setStep('location');
  };

  const handlePickupSelect = (location: Location) => {
    setPickupLocation(location);
    setPickupAddress(location.address);
  };

  const handleDropSelect = (location: Location) => {
    setDropLocation(location);
    setDropAddress(location.address);
  };

  const performReverseGeocode = (lat: number, lng: number, callback: (addr: string) => void) => {
    if (typeof google === 'undefined' || !google.maps || !google.maps.Geocoder) {
      callback(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      return;
    }
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        callback(results[0].formatted_address);
      } else {
        callback(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    });
  };

  const handleLocationConfirm = () => {
    if (!pickupAddress) {
      toast.error('Please enter a pickup location');
      return;
    }
    const pLoc = pickupLocation || { lat: latitude || 12.9716, lng: longitude || 77.5946, address: pickupAddress };
    setPickup(pLoc);
    if (dropAddress && dropLocation) {
      setDrop(dropLocation);
    } else if (dropAddress) {
      setDrop({ lat: (latitude || 12.9716) + 0.02, lng: (longitude || 77.5946) + 0.01, address: dropAddress });
    }
    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (!profile) return;
    try {
      const id = await confirmBooking(profile.uid, profile.phone);
      setBookingId(id);
      setStep('success');
      toast.success('Booking confirmed! 🎉');
    } catch {
      toast.error('Booking failed. Please try again.');
    }
  };

  // Build map markers for the location step
  const locationMarkers: MapMarkerData[] = [];
  if (pickupLocation) {
    locationMarkers.push({
      id: 'pickup',
      position: { lat: pickupLocation.lat, lng: pickupLocation.lng },
      title: 'Pickup',
      role: 'pickup',
      info: 'Drag to adjust exact location',
      draggable: true,
      onDragEnd: (lat, lng) => {
        performReverseGeocode(lat, lng, (addr) => {
          setPickupLocation({ lat, lng, address: addr });
          setPickupAddress(addr);
        });
      }
    });
  } else if (latitude && longitude) {
    locationMarkers.push({ id: 'current', position: { lat: latitude, lng: longitude }, title: 'Your Location', role: 'customer' });
  }
  
  if (dropLocation) {
    locationMarkers.push({
      id: 'drop',
      position: { lat: dropLocation.lat, lng: dropLocation.lng },
      title: 'Drop-off',
      role: 'drop',
      info: 'Drag to adjust exact location',
      draggable: true,
      onDragEnd: (lat, lng) => {
        performReverseGeocode(lat, lng, (addr) => {
          setDropLocation({ lat, lng, address: addr });
          setDropAddress(addr);
        });
      }
    });
  }

  return (
    <div className="px-4 py-5 max-w-lg mx-auto">
      {/* Progress Bar */}
      <div className="flex items-center gap-2 mb-6">
        {['service', 'location', 'confirm'].map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              i <= ['service', 'location', 'confirm'].indexOf(step) ? 'gradient-primary' : 'bg-border'
            }`} />
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Service Selection */}
        {step === 'service' && (
          <motion.div key="service" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Choose a Service</h2>
              <p className="text-sm text-muted mt-1">What kind of help do you need?</p>
            </div>
            <div className="space-y-3">
              {services.map((s) => (
                <Card key={s.type} hoverable onClick={() => handleServiceSelect(s.type)} className={`${serviceType === s.type ? 'ring-2 ring-primary' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center`}><s.icon className="text-white" size={22} /></div>
                    <div className="flex-1"><h3 className="font-semibold text-foreground">{s.label}</h3><p className="text-xs text-muted mt-0.5">{s.desc}</p></div>
                    <ChevronRight className="text-muted" size={16} />
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Location with Google Map */}
        {step === 'location' && (
          <motion.div key="location" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <button onClick={() => setStep('service')} className="flex items-center gap-1 text-sm text-muted hover:text-primary transition-colors">
              <ChevronLeft size={16} /> Back
            </button>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Set Location</h2>
              <p className="text-sm text-muted mt-1">Where should we come?</p>
            </div>

            {/* Live Google Map */}
            <GoogleMap
              center={pickupLocation ? { lat: pickupLocation.lat, lng: pickupLocation.lng } : latitude && longitude ? { lat: latitude, lng: longitude } : undefined}
              markers={locationMarkers}
              fitMarkers={locationMarkers.length > 1}
              height="220px"
              showRoute={!!pickupLocation && !!dropLocation}
              routeOrigin={pickupLocation ? { lat: pickupLocation.lat, lng: pickupLocation.lng } : undefined}
              routeDestination={dropLocation ? { lat: dropLocation.lat, lng: dropLocation.lng } : undefined}
              onMapClick={(lat, lng) => {
                if (!pickupLocation) {
                  performReverseGeocode(lat, lng, (addr) => {
                    setPickupLocation({ lat, lng, address: addr });
                    setPickupAddress(addr);
                  });
                } else if (!dropLocation) {
                  performReverseGeocode(lat, lng, (addr) => {
                    setDropLocation({ lat, lng, address: addr });
                    setDropAddress(addr);
                  });
                } else {
                  // If both exist, allow clicking to move pickup
                  performReverseGeocode(lat, lng, (addr) => {
                    setPickupLocation({ lat, lng, address: addr });
                    setPickupAddress(addr);
                  });
                }
              }}
              className="rounded-2xl"
            />
            
            <p className="text-xs text-center text-muted flex items-center justify-center gap-1">
              <MapPin size={12} /> Map GPS inaccurate? Click the map or drag the pin to set exact location.
            </p>

            <div className="space-y-1">
              <div className="flex justify-between items-end mb-1">
                <label className="text-sm font-medium text-foreground">Pickup Location</label>
                <button 
                  type="button" 
                  onClick={() => {
                    if (latitude && longitude) {
                      performReverseGeocode(latitude, longitude, (addr) => {
                        setPickupAddress(addr);
                        setPickupLocation({ lat: latitude, lng: longitude, address: addr });
                      });
                    } else {
                      toast.error('Unable to get current location. Check browser permissions.');
                    }
                  }}
                  className="text-xs text-primary flex items-center gap-1 hover:underline font-medium px-2 py-1 bg-primary/5 rounded-md"
                >
                  <Navigation size={12} />
                  Use Current Location
                </button>
              </div>
              <LocationAutocomplete
                id="pickup-autocomplete"
                placeholder="Search pickup address..."
                value={pickupAddress}
                onChange={setPickupAddress}
                onLocationSelect={handlePickupSelect}
                icon={<MapPin size={16} />}
              />
            </div>

            <LocationAutocomplete
              id="drop-autocomplete"
              label="Drop Location (optional)"
              placeholder="Search drop address..."
              value={dropAddress}
              onChange={setDropAddress}
              onLocationSelect={handleDropSelect}
              icon={<MapPin size={16} />}
            />

            <Button size="lg" className="w-full" onClick={handleLocationConfirm}>
              Continue <ChevronRight size={16} />
            </Button>
          </motion.div>
        )}

        {/* Step 3: Confirmation */}
        {step === 'confirm' && (
          <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <button onClick={() => setStep('location')} className="flex items-center gap-1 text-sm text-muted hover:text-primary transition-colors">
              <ChevronLeft size={16} /> Back
            </button>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Confirm Booking</h2>
              <p className="text-sm text-muted mt-1">Review your booking details</p>
            </div>

            {/* Route Preview Map */}
            {pickup && (
              <GoogleMap
                markers={[
                  { id: 'pickup-confirm', position: { lat: pickup.lat, lng: pickup.lng }, title: 'Pickup', role: 'pickup', info: pickup.address },
                  ...(drop ? [{ id: 'drop-confirm', position: { lat: drop.lat, lng: drop.lng }, title: 'Drop-off', role: 'drop' as const, info: drop.address }] : []),
                ]}
                fitMarkers
                height="180px"
                showRoute={!!drop}
                routeOrigin={pickup ? { lat: pickup.lat, lng: pickup.lng } : undefined}
                routeDestination={drop ? { lat: drop.lat, lng: drop.lng } : undefined}
                className="rounded-2xl"
              />
            )}

            <Card variant="elevated">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center"><Car className="text-white" size={18} /></div>
                  <div><p className="text-xs text-muted">Service</p><p className="font-semibold text-foreground text-sm">{services.find(s => s.type === serviceType)?.label}</p></div>
                </div>
                <hr className="border-border" />
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
                    <div><p className="text-xs text-muted">Pickup</p><p className="text-sm font-medium text-foreground">{pickup?.address}</p></div>
                  </div>
                  {drop && (
                    <div className="flex items-start gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-500 mt-1 flex-shrink-0" />
                      <div><p className="text-xs text-muted">Drop</p><p className="text-sm font-medium text-foreground">{drop.address}</p></div>
                    </div>
                  )}
                </div>
                <hr className="border-border" />
                
                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted">Base Fare</span>
                    <span className="font-medium text-foreground">{formatCurrency(priceBreakdown?.basePrice || estimatedFare)}</span>
                  </div>
                  {priceBreakdown && priceBreakdown.weatherSurge > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted">Weather Surge</span>
                      <span className="font-medium text-amber-500">+{formatCurrency(priceBreakdown.weatherSurge)}</span>
                    </div>
                  )}
                  {priceBreakdown && priceBreakdown.trafficSurge > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted">Traffic Surge</span>
                      <span className="font-medium text-red-500">+{formatCurrency(priceBreakdown.trafficSurge)}</span>
                    </div>
                  )}
                  {priceBreakdown && priceBreakdown.demandSurge > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted">High Demand</span>
                      <span className="font-medium text-purple-500">+{formatCurrency(priceBreakdown.demandSurge)}</span>
                    </div>
                  )}
                  {priceBreakdown && priceBreakdown.emergencyFee > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted">Emergency Priority</span>
                      <span className="font-medium text-red-500">+{formatCurrency(priceBreakdown.emergencyFee)}</span>
                    </div>
                  )}
                </div>

                <hr className="border-border" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><CreditCard className="text-muted" size={16} /><span className="text-sm font-semibold text-foreground">Total Final Price</span></div>
                  <span className="text-xl font-black text-primary">{formatCurrency(estimatedFare)}</span>
                </div>
              </div>
            </Card>
            <Button size="lg" className="w-full" onClick={handleConfirm} isLoading={isBooking}>Confirm & Book</Button>
            <p className="text-xs text-muted text-center">You will be charged after the service is completed</p>
          </motion.div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12 space-y-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15, stiffness: 200 }} className="w-24 h-24 mx-auto rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="text-success" size={48} />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Booking Confirmed!</h2>
              <p className="text-sm text-muted mt-1">We&apos;re finding the nearest provider for you</p>
            </div>
            <Card variant="gradient" className="text-left">
              <p className="text-xs text-muted">Booking ID</p>
              <p className="text-sm font-mono font-medium text-foreground">{bookingId}</p>
            </Card>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => router.push(`/track/${bookingId}`)}>Track Live</Button>
              <Button className="flex-1" onClick={() => router.push('/dashboard')}>Go Home</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <BookingPageContent />
    </Suspense>
  );
}
