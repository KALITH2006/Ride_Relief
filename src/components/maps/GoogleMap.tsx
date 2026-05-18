'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { useThemeStore } from '@/stores/themeStore';
import type { LiveLocation } from '@/lib/types';

// Dark mode map style
const darkMapStyle: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#cbd5e1' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1a3a2a' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#4ade80' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#334155' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1e293b' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#475569' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#334155' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#e2e8f0' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#334155' }] },
  { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#cbd5e1' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0c4a6e' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#38bdf8' }] },
];

export interface MapMarkerData {
  id: string;
  position: { lat: number; lng: number };
  title?: string;
  role?: LiveLocation['role'] | 'customer' | 'pickup' | 'drop' | 'sos';
  heading?: number;
  info?: string;
  draggable?: boolean;
  onDragEnd?: (lat: number, lng: number) => void;
}

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarkerData[];
  className?: string;
  showRoute?: boolean;
  routeOrigin?: { lat: number; lng: number };
  routeDestination?: { lat: number; lng: number };
  encodedPolyline?: string;
  onMapClick?: (lat: number, lng: number) => void;
  onMapReady?: (map: google.maps.Map) => void;
  onRouteCalculated?: (distanceText: string, durationText: string, distanceValue: number, durationValue: number, polyline: string) => void;
  fitMarkers?: boolean;
  height?: string;
}

const MARKER_CONFIGS: Record<string, { color: string; emoji: string; scale: number }> = {
  driver: { color: '#3b82f6', emoji: '🚗', scale: 1.2 },
  mechanic: { color: '#f59e0b', emoji: '🔧', scale: 1.1 },
  rental_car: { color: '#10b981', emoji: '🚙', scale: 1.2 },
  customer: { color: '#8b5cf6', emoji: '👤', scale: 1.0 },
  pickup: { color: '#10b981', emoji: '📍', scale: 1.3 },
  drop: { color: '#ef4444', emoji: '🏁', scale: 1.3 },
  sos: { color: '#ef4444', emoji: '🆘', scale: 1.5 },
};

function createMarkerElement(role: string, heading?: number): HTMLDivElement {
  const config = MARKER_CONFIGS[role] || MARKER_CONFIGS.customer;
  const el = document.createElement('div');
  el.className = 'map-marker-custom';
  el.style.cssText = `
    width: ${36 * config.scale}px;
    height: ${36 * config.scale}px;
    border-radius: 50%;
    background: ${config.color};
    border: 3px solid white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${16 * config.scale}px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3), 0 0 0 2px ${config.color}40;
    cursor: pointer;
    transition: transform 0.3s ease;
    ${heading !== undefined ? `transform: rotate(${heading}deg);` : ''}
  `;

  if (role === 'sos') {
    el.style.animation = 'sos-marker-pulse 1.5s ease-in-out infinite';
  }

  el.innerHTML = `<span style="transform: ${heading !== undefined ? `rotate(-${heading}deg)` : 'none'}; line-height: 1;">${config.emoji}</span>`;
  return el;
}

export default function GoogleMap({
  center = { lat: 12.9716, lng: 77.5946 },
  zoom = 14,
  markers = [],
  className = '',
  showRoute = false,
  routeOrigin,
  routeDestination,
  encodedPolyline,
  onMapClick,
  onMapReady,
  onRouteCalculated,
  fitMarkers = false,
  height = '300px',
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const directionsRenderer = useRef<google.maps.DirectionsRenderer | null>(null);
  const { isLoaded, loadError } = useGoogleMaps();
  const isDark = useThemeStore((s) => s.isDark);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstance.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center,
      zoom,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: isDark ? darkMapStyle : [],
      gestureHandling: 'greedy',
    });

    mapInstance.current = map;

    if (onMapClick) {
      map.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          onMapClick(e.latLng.lat(), e.latLng.lng());
        }
      });
    }

    if (onMapReady) {
      onMapReady(map);
    }
  }, [isLoaded]);

  // Update map style on theme change
  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.setOptions({
        styles: isDark ? darkMapStyle : [],
      });
    }
  }, [isDark]);

  // Update markers
  useEffect(() => {
    if (!mapInstance.current || !isLoaded) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    const bounds = new google.maps.LatLngBounds();

    markers.forEach((markerData) => {
      const config = MARKER_CONFIGS[markerData.role || 'customer'] || MARKER_CONFIGS.customer;

      const marker = new google.maps.Marker({
        map: mapInstance.current!,
        position: markerData.position,
        title: markerData.title,
        draggable: markerData.draggable || false,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: config.color,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
          scale: 12 * config.scale,
        },
        label: {
          text: config.emoji,
          fontSize: `${14 * config.scale}px`,
        },
        animation: markerData.role === 'sos' ? google.maps.Animation.BOUNCE : undefined,
      });

      if (markerData.info) {
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px 12px; font-family: 'Inter', sans-serif; max-width: 200px;">
              <p style="font-weight: 600; font-size: 13px; margin: 0 0 4px;">${markerData.title || ''}</p>
              <p style="font-size: 12px; color: #64748b; margin: 0;">${markerData.info}</p>
            </div>
          `,
        });
        marker.addListener('click', () => {
          infoWindow.open(mapInstance.current!, marker);
        });
      }

      if (markerData.draggable && markerData.onDragEnd) {
        marker.addListener('dragend', () => {
          const pos = marker.getPosition();
          if (pos) {
            markerData.onDragEnd!(pos.lat(), pos.lng());
          }
        });
      }

      markersRef.current.push(marker);
      bounds.extend(markerData.position);
    });

    // Fit bounds to markers
    if (fitMarkers && markers.length > 1) {
      mapInstance.current.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
    } else if (markers.length === 1) {
      mapInstance.current.setCenter(markers[0].position);
    }
  }, [markers, isLoaded, fitMarkers]);

  // Draw route
  useEffect(() => {
    if (!mapInstance.current || !showRoute || !routeOrigin || !routeDestination || !isLoaded) return;

    if (!directionsRenderer.current) {
      directionsRenderer.current = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#3b82f6',
          strokeWeight: 5,
          strokeOpacity: 0.8,
        },
      });
      directionsRenderer.current.setMap(mapInstance.current);
    }

    const directionsService = new google.maps.DirectionsService();
    directionsService.route(
      {
        origin: routeOrigin,
        destination: routeDestination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === 'OK' && result && directionsRenderer.current) {
          directionsRenderer.current.setDirections(result);
          
          if (onRouteCalculated && result.routes && result.routes[0] && result.routes[0].legs[0]) {
            const leg = result.routes[0].legs[0];
            const polyline = result.routes[0].overview_polyline;
            if (leg.distance && leg.duration) {
              onRouteCalculated(leg.distance.text, leg.duration.text, leg.distance.value, leg.duration.value, polyline);
            }
          }
        }
      }
    );

    return () => {
      if (directionsRenderer.current) {
        directionsRenderer.current.setMap(null);
        directionsRenderer.current = null;
      }
    };
  }, [showRoute, routeOrigin, routeDestination, isLoaded]);

  // Draw Encoded Polyline (for customers tracking driver)
  useEffect(() => {
    if (!mapInstance.current || !encodedPolyline || !isLoaded || (showRoute && routeOrigin && routeDestination)) return;

    const polyline = new google.maps.Polyline({
      path: google.maps.geometry.encoding.decodePath(encodedPolyline),
      strokeColor: '#3b82f6',
      strokeWeight: 5,
      strokeOpacity: 0.8,
      map: mapInstance.current,
    });

    return () => {
      polyline.setMap(null);
    };
  }, [encodedPolyline, isLoaded, showRoute, routeOrigin, routeDestination]);

  if (loadError) {
    return (
      <div
        className={`flex items-center justify-center bg-surface border border-border rounded-2xl ${className}`}
        style={{ height }}
      >
        <div className="text-center p-4">
          <p className="text-sm text-danger font-medium">Map failed to load</p>
          <p className="text-xs text-muted mt-1">{loadError}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl ${className}`}
        style={{ height }}
      >
        <div className="absolute inset-0 skeleton" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-muted">Loading map...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className={`map-container ${className}`}
      style={{ height, minHeight: height }}
    />
  );
}
