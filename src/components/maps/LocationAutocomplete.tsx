'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Navigation, X, Loader2 } from 'lucide-react';
import { useAutocompleteService, useGeocoderService } from '@/hooks/useGoogleMaps';
import type { Location } from '@/lib/types';

interface LocationAutocompleteProps {
  id: string;
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onLocationSelect: (location: Location) => void;
  icon?: React.ReactNode;
  className?: string;
  currentLocation?: { lat: number; lng: number } | null;
}

interface Prediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export default function LocationAutocomplete({
  id, label, placeholder = 'Search for a location...', value, onChange,
  onLocationSelect, icon, className = '', currentLocation
}: LocationAutocompleteProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const autocompleteService = useAutocompleteService();
  const geocoder = useGeocoderService();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchPredictions = useCallback((input: string) => {
    if (!autocompleteService || input.length < 3) { setPredictions([]); return; }
    
    const request: google.maps.places.AutocompletionRequest = { 
      input, 
      componentRestrictions: { country: 'in' }
    };

    if (currentLocation && typeof google !== 'undefined') {
      // Bias results to 50km around current location
      request.locationBias = {
        center: { lat: currentLocation.lat, lng: currentLocation.lng },
        radius: 50000
      };
    }

    autocompleteService.getPlacePredictions(
      request,
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          setPredictions(results.map((r) => ({
            placeId: r.place_id, description: r.description,
            mainText: r.structured_formatting.main_text,
            secondaryText: r.structured_formatting.secondary_text,
          })));
          setIsOpen(true);
        } else { setPredictions([]); }
      }
    );
  }, [autocompleteService, currentLocation]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPredictions(val), 300);
  };

  const handleSelect = async (prediction: Prediction) => {
    onChange(prediction.description);
    setIsOpen(false);
    setPredictions([]);
    if (!geocoder) return;
    setIsGeocoding(true);
    try {
      const result = await geocoder.geocode({ placeId: prediction.placeId });
      if (result.results[0]) {
        const loc = result.results[0].geometry.location;
        onLocationSelect({ lat: loc.lat(), lng: loc.lng(), address: prediction.description });
      }
    } catch (err) { console.error('Geocoding failed:', err); }
    finally { setIsGeocoding(false); }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation || !geocoder) return;
    setIsGeocoding(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        try {
          const result = await geocoder.geocode({ location: { lat, lng } });
          if (result.results[0]) {
            const address = result.results[0].formatted_address;
            onChange(address);
            onLocationSelect({ lat, lng, address });
          }
        } catch { onChange(`${lat.toFixed(4)}, ${lng.toFixed(4)}`); onLocationSelect({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` }); }
        finally { setIsGeocoding(false); }
      },
      () => { setIsGeocoding(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {label && <label htmlFor={id} className="block text-sm font-medium text-foreground mb-1.5">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">{icon}</div>}
        <input id={id} type="text" value={value} onChange={handleInputChange}
          onFocus={() => predictions.length > 0 && setIsOpen(true)} placeholder={placeholder} autoComplete="off"
          className={`w-full py-3 bg-surface border border-border rounded-xl text-foreground text-sm transition-all focus:border-primary focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] ${icon ? 'pl-10' : 'pl-4'} pr-20`} />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isGeocoding && <Loader2 size={16} className="text-primary animate-spin" />}
          {value && <button type="button" onClick={() => { onChange(''); setPredictions([]); }} className="p-1 rounded-lg hover:bg-border/50 text-muted transition-colors"><X size={14} /></button>}
          <button type="button" onClick={handleUseCurrentLocation} className="p-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors" title="Use current location"><Navigation size={14} /></button>
        </div>
      </div>
      {isOpen && predictions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-surface border border-border rounded-xl shadow-lg overflow-hidden animate-scale-in">
          {predictions.map((p) => (
            <button key={p.placeId} type="button" onClick={() => handleSelect(p)} className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors flex items-start gap-3 border-b border-border/50 last:border-0">
              <MapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
              <div><p className="text-sm font-medium text-foreground">{p.mainText}</p><p className="text-xs text-muted mt-0.5">{p.secondaryText}</p></div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
