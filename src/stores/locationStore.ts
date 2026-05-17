'use client';

import { create } from 'zustand';
import type { LiveLocation } from '@/lib/types';
import {
  updateLiveLocation,
  subscribeToLiveLocation,
  getNearbyProviders,
} from '@/lib/firestore';

interface LocationState {
  // Current user's location
  myLocation: { lat: number; lng: number } | null;

  // Tracked locations (other users)
  trackedLocations: Map<string, LiveLocation>;

  // Nearby providers
  nearbyDrivers: LiveLocation[];
  nearbyMechanics: LiveLocation[];
  nearbyRentalCars: LiveLocation[];

  // Tracking state
  isTracking: boolean;
  watchId: number | null;
  lastBroadcastTime: number | null;

  // Actions
  setMyLocation: (lat: number, lng: number) => void;
  startTracking: (userId: string, role: LiveLocation['role']) => void;
  stopTracking: () => void;
  trackUser: (userId: string, callback: (location: LiveLocation) => void) => () => void;
  fetchNearbyProviders: (lat: number, lng: number) => Promise<void>;
  broadcastLocation: (userId: string, role: LiveLocation['role'], lat: number, lng: number, heading?: number, speed?: number) => Promise<void>;
}

export const useLocationStore = create<LocationState>((set, get) => ({
  myLocation: null,
  trackedLocations: new Map(),
  nearbyDrivers: [],
  nearbyMechanics: [],
  nearbyRentalCars: [],
  isTracking: false,
  watchId: null,
  lastBroadcastTime: null,

  setMyLocation: (lat, lng) => {
    set({ myLocation: { lat, lng } });
  },

  startTracking: (userId, role) => {
    if (get().isTracking) return;

    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude: lat, longitude: lng, heading, speed } = position.coords;
        set({ myLocation: { lat, lng } });

        const now = Date.now();
        const lastTime = get().lastBroadcastTime || 0;

        // Broadcast to Firestore with 5-second throttling to prevent spam
        if (now - lastTime >= 5000) {
          get().broadcastLocation(userId, role, lat, lng, heading ?? undefined, speed ?? undefined);
          set({ lastBroadcastTime: now });
        }
      },
      (error) => {
        console.error('Geolocation error:', error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      }
    );

    set({ isTracking: true, watchId });
  },

  stopTracking: () => {
    const { watchId } = get();
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
    }
    set({ isTracking: false, watchId: null });
  },

  trackUser: (userId, callback) => {
    // Demo users — simulate movement
    if (userId.startsWith('demo_')) {
      const baseLat = 12.9716;
      const baseLng = 77.5946;
      let step = 0;

      const interval = setInterval(() => {
        step++;
        const demoLocation: LiveLocation = {
          userId,
          role: 'driver',
          lat: baseLat + step * 0.001 * Math.sin(step * 0.3),
          lng: baseLng + step * 0.0008 * Math.cos(step * 0.2),
          heading: (step * 15) % 360,
          speed: 20 + Math.random() * 30,
          updatedAt: new Date(),
          isOnline: true,
        };

        const locations = new Map(get().trackedLocations);
        locations.set(userId, demoLocation);
        set({ trackedLocations: locations });
        callback(demoLocation);
      }, 3000);

      return () => clearInterval(interval);
    }

    return subscribeToLiveLocation(userId, (location) => {
      if (location) {
        const locations = new Map(get().trackedLocations);
        locations.set(userId, location);
        set({ trackedLocations: locations });
        callback(location);
      }
    });
  },

  fetchNearbyProviders: async (lat, lng) => {
    try {
      const [drivers, mechanics, rentalCars] = await Promise.all([
        getNearbyProviders(lat, lng, 'driver'),
        getNearbyProviders(lat, lng, 'mechanic'),
        getNearbyProviders(lat, lng, 'rental_car'),
      ]);
      set({ nearbyDrivers: drivers, nearbyMechanics: mechanics, nearbyRentalCars: rentalCars });
    } catch (err) {
      console.error('Failed to fetch nearby providers:', err);
    }
  },

  broadcastLocation: async (userId, role, lat, lng, heading, speed) => {
    // Skip Firestore writes for demo users
    if (userId.startsWith('demo_')) return;

    try {
      await updateLiveLocation({
        userId,
        role,
        lat,
        lng,
        heading,
        speed,
        updatedAt: new Date(),
        isOnline: true,
      });
    } catch (err) {
      console.error('Failed to broadcast location:', err);
    }
  },
}));
