'use client';

import { create } from 'zustand';
import type { Booking, ServiceType, BookingStatus, Location } from '@/lib/types';
import { createBooking, updateBooking, getUserBookings, createSOSRequest, findNearestProvider, createTrackingRoom } from '@/lib/firestore';
import { generateId, estimateFare } from '@/lib/utils';

interface BookingState {
  // Current booking flow
  serviceType: ServiceType | null;
  pickup: Location | null;
  drop: Location | null;
  estimatedFare: number;
  isBooking: boolean;

  // Bookings list
  bookings: Booking[];
  activeBooking: Booking | null;
  isLoadingBookings: boolean;

  // Actions
  setServiceType: (type: ServiceType) => void;
  setPickup: (location: Location) => void;
  setDrop: (location: Location) => void;
  calculateFare: () => void;
  confirmBooking: (userId: string, phone: string) => Promise<string>;
  cancelBooking: (bookingId: string) => Promise<void>;
  loadBookings: (userId: string) => Promise<void>;
  setActiveBooking: (booking: Booking | null) => void;
  resetBookingFlow: () => void;
  createSOSBooking: (userId: string, phone: string, location: Location) => Promise<string>;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  serviceType: null,
  pickup: null,
  drop: null,
  estimatedFare: 0,
  isBooking: false,
  bookings: [],
  activeBooking: null,
  isLoadingBookings: false,

  setServiceType: (type) => set({ serviceType: type }),

  setPickup: (location) => {
    set({ pickup: location });
    get().calculateFare();
  },

  setDrop: (location) => {
    set({ drop: location });
    get().calculateFare();
  },

  calculateFare: () => {
    const { pickup, drop, serviceType } = get();
    if (!pickup || !serviceType) return;

    // Simple distance calculation (Haversine approximation)
    let distanceKm = 5; // Default
    if (drop) {
      const R = 6371;
      const dLat = ((drop.lat - pickup.lat) * Math.PI) / 180;
      const dLon = ((drop.lng - pickup.lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((pickup.lat * Math.PI) / 180) *
          Math.cos((drop.lat * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distanceKm = R * c;
    }

    const fare = estimateFare(distanceKm, serviceType);
    set({ estimatedFare: fare });
  },

  confirmBooking: async (userId, phone) => {
    const { serviceType, pickup, drop, estimatedFare } = get();
    if (!serviceType || !pickup) throw new Error('Missing booking details');

    set({ isBooking: true });
    try {
      // Mock for demo users
      if (userId.startsWith('demo_')) {
        await new Promise(r => setTimeout(r, 1000));
        const demoId = `bk_demo_${Date.now()}`;
        set({ isBooking: false });
        get().resetBookingFlow();
        return demoId;
      }
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      const id = await createBooking({
        userId,
        driverId: null,
        serviceType,
        status: 'requested',
        pickup,
        drop: drop || null,
        amount: estimatedFare,
        paymentStatus: 'pending',
        isSOS: false,
        priority: 'normal',
        customerPhone: phone,
        rating: null,
        notes: '',
        createdAt: new Date(),
        otp,
        otpVerified: false,
      });

      // Find nearest provider
      const provider = await findNearestProvider(pickup.lat, pickup.lng, serviceType, 10);
      if (provider) {
        // Dispatch logic: In a real app we'd push to a queue or notify the driver.
        // For now, we simulate dispatching to the nearest provider.
        console.log(`Dispatched to provider ${provider.userId}`);
      }

      set({ isBooking: false });
      get().resetBookingFlow();
      return id;
    } catch (err) {
      set({ isBooking: false });
      throw err;
    }
  },

  cancelBooking: async (bookingId) => {
    // Mock for demo bookings
    if (!bookingId.startsWith('bk_demo_')) {
      await updateBooking(bookingId, { status: 'cancelled' });
    }
    const { bookings } = get();
    set({
      bookings: bookings.map((b) =>
        b.id === bookingId ? { ...b, status: 'cancelled' as BookingStatus } : b
      ),
    });
  },

  loadBookings: async (userId) => {
    set({ isLoadingBookings: true });
    try {
      // Mock for demo users
      if (userId.startsWith('demo_')) {
        await new Promise(r => setTimeout(r, 500));
        set({ bookings: [], activeBooking: null, isLoadingBookings: false });
        return;
      }
      const bookings = await getUserBookings(userId);
      const active = bookings.find(
        (b) => !['completed', 'cancelled'].includes(b.status)
      );
      set({ bookings, activeBooking: active || null, isLoadingBookings: false });
    } catch {
      set({ isLoadingBookings: false });
    }
  },

  setActiveBooking: (booking) => set({ activeBooking: booking }),

  resetBookingFlow: () =>
    set({
      serviceType: null,
      pickup: null,
      drop: null,
      estimatedFare: 0,
    }),

  createSOSBooking: async (userId, phone, location) => {
    set({ isBooking: true });
    try {
      // Mock for demo users
      if (userId.startsWith('demo_')) {
        await new Promise(r => setTimeout(r, 1000));
        const demoId = `bk_demo_sos_${Date.now()}`;
        set({ isBooking: false });
        return demoId;
      }
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      const id = await createBooking({
        userId,
        driverId: null,
        serviceType: 'emergency',
        status: 'requested',
        pickup: location,
        drop: null,
        amount: 0,
        paymentStatus: 'pending',
        isSOS: true,
        priority: 'emergency',
        customerPhone: phone,
        rating: null,
        notes: 'SOS Emergency Request',
        createdAt: new Date(),
        otp,
        otpVerified: false,
      });

      // Save to sosRequests collection
      await createSOSRequest({
        customerId: userId,
        bookingId: id,
        serviceType: 'SOS',
        location: { lat: location.lat, lng: location.lng },
        status: 'searching',
        priority: 'high',
      });

      // Find nearest emergency/mechanic provider
      const provider = await findNearestProvider(location.lat, location.lng, 'emergency', 15);
      if (provider) {
        console.log(`SOS Dispatched to provider ${provider.userId}`);
      }

      set({ isBooking: false });
      return id;
    } catch (err) {
      set({ isBooking: false });
      throw err;
    }
  },
}));
