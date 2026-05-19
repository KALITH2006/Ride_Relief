/**
 * OpenStreetMap services – replaces Google Places, Geocoding & Directions APIs.
 * All endpoints are free and require no API keys.
 */

// ── Nominatim Geocoding ──────────────────────────────────────────────────────

export interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  address: Record<string, string>;
}

/**
 * Forward geocode – search for places by text query.
 * Restricted to India (countrycodes=in) for RideRelief.
 */
export async function searchPlaces(
  query: string,
  limit = 5,
): Promise<NominatimResult[]> {
  if (!query || query.length < 3) return [];

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('countrycodes', 'in');

  const res = await fetch(url.toString(), {
    headers: { 'Accept-Language': 'en' },
  });
  if (!res.ok) return [];
  return res.json();
}

/**
 * Reverse geocode – lat/lng → address string.
 */
export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<string> {
  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lng));
  url.searchParams.set('format', 'json');

  try {
    const res = await fetch(url.toString(), {
      headers: { 'Accept-Language': 'en' },
    });
    if (!res.ok) return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    const data = await res.json();
    return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
}

// ── OSRM Routing ─────────────────────────────────────────────────────────────

export interface RouteResult {
  distanceMeters: number;
  distanceText: string;
  durationSeconds: number;
  durationText: string;
  coordinates: [number, number][]; // [lat, lng][]
}

/**
 * Get driving route between two points via OSRM public demo server.
 * Returns distance, duration and an array of [lat, lng] waypoints for the polyline.
 */
export async function getRoute(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
): Promise<RouteResult | null> {
  // OSRM expects lon,lat order
  const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=false`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();

    if (!data.routes || data.routes.length === 0) return null;

    const route = data.routes[0];
    const distanceMeters: number = route.distance;
    const durationSeconds: number = route.duration;

    // OSRM GeoJSON coordinates are [lng, lat] – flip to [lat, lng] for Leaflet
    const coordinates: [number, number][] = route.geometry.coordinates.map(
      (c: [number, number]) => [c[1], c[0]] as [number, number],
    );

    const distanceText =
      distanceMeters >= 1000
        ? `${(distanceMeters / 1000).toFixed(1)} km`
        : `${Math.round(distanceMeters)} m`;

    const mins = Math.round(durationSeconds / 60);
    const durationText =
      mins >= 60
        ? `${Math.floor(mins / 60)}h ${mins % 60}m`
        : `${mins} min`;

    return { distanceMeters, distanceText, durationSeconds, durationText, coordinates };
  } catch {
    return null;
  }
}
