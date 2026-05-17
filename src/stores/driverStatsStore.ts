import { create } from 'zustand';
import type { DriverStats } from '@/lib/types';
import { subscribeToDriverStats } from '@/lib/firestore';

interface DriverStatsState {
  stats: DriverStats | null;
  isLoading: boolean;
  unsubscribe: (() => void) | null;
  startListening: (driverId: string) => void;
  stopListening: () => void;
}

export const useDriverStatsStore = create<DriverStatsState>((set, get) => ({
  stats: null,
  isLoading: true,
  unsubscribe: null,

  startListening: (driverId: string) => {
    if (get().unsubscribe) {
      get().stopListening();
    }
    
    // For demo accounts, load mock data
    if (driverId.startsWith('demo_')) {
      set({
        stats: {
          driverId,
          totalTrips: 124,
          todayTrips: 5,
          todayEarnings: 1240,
          weeklyEarnings: 8450,
          monthlyEarnings: 32400,
          completedSOS: 12,
          rating: 4.8,
        },
        isLoading: false
      });
      return;
    }

    set({ isLoading: true });
    const unsub = subscribeToDriverStats(driverId, (data) => {
      set({
        stats: data || {
          driverId,
          totalTrips: 0,
          todayTrips: 0,
          todayEarnings: 0,
          weeklyEarnings: 0,
          monthlyEarnings: 0,
          completedSOS: 0,
          rating: 5.0,
        },
        isLoading: false
      });
    });

    set({ unsubscribe: unsub });
  },

  stopListening: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
    }
    set({ unsubscribe: null, stats: null });
  },
}));
