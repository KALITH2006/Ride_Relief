'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getRoute, type RouteResult } from '@/lib/mapServices';
import type { LiveLocation } from '@/lib/types';

// ── Marker colour config ────────────────────────────────────────────────────

const MARKER_CONFIGS: Record<string, { color: string; emoji: string; scale: number }> = {
  driver:     { color: '#3b82f6', emoji: '🚗', scale: 1.2 },
  mechanic:   { color: '#f59e0b', emoji: '🔧', scale: 1.1 },
  rental_car: { color: '#10b981', emoji: '🚙', scale: 1.2 },
  customer:   { color: '#8b5cf6', emoji: '👤', scale: 1.0 },
  pickup:     { color: '#10b981', emoji: '📍', scale: 1.3 },
  drop:       { color: '#ef4444', emoji: '🏁', scale: 1.3 },
  sos:        { color: '#ef4444', emoji: '🆘', scale: 1.5 },
};

function makeDivIcon(role: string): L.DivIcon {
  const cfg = MARKER_CONFIGS[role] || MARKER_CONFIGS.customer;
  const size = Math.round(36 * cfg.scale);
  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${cfg.color};border:3px solid #fff;
      display:flex;align-items:center;justify-content:center;
      font-size:${Math.round(16 * cfg.scale)}px;
      box-shadow:0 4px 12px rgba(0,0,0,.3),0 0 0 2px ${cfg.color}40;
      cursor:pointer;
      ${role === 'sos' ? 'animation:sos-marker-pulse 1.5s ease-in-out infinite;' : ''}
    "><span style="line-height:1">${cfg.emoji}</span></div>`,
  });
}

// ── Types ───────────────────────────────────────────────────────────────────

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

interface LeafletMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarkerData[];
  className?: string;
  showRoute?: boolean;
  routeOrigin?: { lat: number; lng: number };
  routeDestination?: { lat: number; lng: number };
  onMapClick?: (lat: number, lng: number) => void;
  onRouteCalculated?: (
    distanceText: string,
    durationText: string,
    distanceValue: number,
    durationValue: number,
    polyline: string,
  ) => void;
  fitMarkers?: boolean;
  height?: string;
}

// Chennai default
const DEFAULT_CENTER = { lat: 13.0827, lng: 80.2707 };

// ── Component ───────────────────────────────────────────────────────────────

export default function LeafletMapClient({
  center,
  zoom = 14,
  markers = [],
  className = '',
  showRoute = false,
  routeOrigin,
  routeDestination,
  onMapClick,
  onRouteCalculated,
  fitMarkers = false,
  height = '300px',
}: LeafletMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const [ready, setReady] = useState(false);

  // ── Initialise map once ───────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const c = center || DEFAULT_CENTER;
    const map = L.map(containerRef.current, {
      center: [c.lat, c.lng],
      zoom,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    markerLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    if (onMapClick) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });
    }

    setReady(true);

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Update centre when prop changes ───────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !center) return;
    mapRef.current.flyTo([center.lat, center.lng], mapRef.current.getZoom(), {
      animate: true,
      duration: 0.8,
    });
  }, [center?.lat, center?.lng]);

  // ── Sync markers ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !markerLayerRef.current) return;
    markerLayerRef.current.clearLayers();

    const bounds = L.latLngBounds([]);

    markers.forEach((m) => {
      const icon = makeDivIcon(m.role || 'customer');
      const marker = L.marker([m.position.lat, m.position.lng], {
        icon,
        draggable: m.draggable || false,
        title: m.title,
      });

      if (m.info || m.title) {
        marker.bindPopup(
          `<div style="font-family:'Inter',sans-serif;max-width:200px;padding:4px">
            <p style="font-weight:600;font-size:13px;margin:0 0 4px">${m.title || ''}</p>
            <p style="font-size:12px;color:#64748b;margin:0">${m.info || ''}</p>
          </div>`,
        );
      }

      if (m.draggable && m.onDragEnd) {
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          m.onDragEnd!(pos.lat, pos.lng);
        });
      }

      marker.addTo(markerLayerRef.current!);
      bounds.extend([m.position.lat, m.position.lng]);
    });

    if (fitMarkers && markers.length > 1 && bounds.isValid()) {
      mapRef.current.fitBounds(bounds, { padding: [50, 50], animate: true });
    } else if (markers.length === 1) {
      mapRef.current.setView([markers[0].position.lat, markers[0].position.lng], mapRef.current.getZoom());
    }
  }, [markers, fitMarkers, ready]);

  // ── Route polyline via OSRM ──────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;

    // Clean old route
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    if (!showRoute || !routeOrigin || !routeDestination) return;

    let cancelled = false;
    getRoute(routeOrigin, routeDestination).then((result: RouteResult | null) => {
      if (cancelled || !result || !mapRef.current) return;

      const polyline = L.polyline(result.coordinates, {
        color: '#3b82f6',
        weight: 5,
        opacity: 0.8,
        smoothFactor: 1,
      }).addTo(mapRef.current);

      routeLayerRef.current = polyline;

      if (onRouteCalculated) {
        onRouteCalculated(
          result.distanceText,
          result.durationText,
          result.distanceMeters,
          result.durationSeconds,
          JSON.stringify(result.coordinates),
        );
      }
    });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRoute, routeOrigin?.lat, routeOrigin?.lng, routeDestination?.lat, routeDestination?.lng, ready]);

  return (
    <div
      ref={containerRef}
      className={`map-container ${className}`}
      style={{ height, minHeight: height, position: 'relative', zIndex: 0 }}
    />
  );
}
