'use client';

import dynamic from 'next/dynamic';
import type { MapMarkerData } from '@/components/maps/LeafletMapClient';

// Re-export the type so consumers can import from this barrel
export type { MapMarkerData };

// Dynamic import with SSR disabled — Leaflet requires `window`
const LeafletMap = dynamic(
  () => import('@/components/maps/LeafletMapClient'),
  {
    ssr: false,
    loading: () => (
      <div className="relative overflow-hidden rounded-2xl" style={{ height: '300px' }}>
        <div className="absolute inset-0 skeleton" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-muted">Loading map...</p>
          </div>
        </div>
      </div>
    ),
  },
);

export default LeafletMap;
