'use client';

import { useState, useEffect } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

let isLoadedGlobal = false;
let isInitialized = false;
let loadPromise: Promise<void> | null = null;

function initLoader() {
  if (isInitialized) return;
  isInitialized = true;
  setOptions({
    key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    v: 'weekly',
  });
}

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(isLoadedGlobal);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoadedGlobal) {
      setIsLoaded(true);
      return;
    }

    initLoader();

    if (!loadPromise) {
      loadPromise = importLibrary('maps')
        .then(() => Promise.all([importLibrary('places'), importLibrary('marker')]))
        .then(() => {
          isLoadedGlobal = true;
        });
    }

    loadPromise
      .then(() => setIsLoaded(true))
      .catch((err) => {
        setLoadError(err?.message || 'Failed to load Google Maps');
      });
  }, []);

  return { isLoaded, loadError };
}

export function useAutocompleteService() {
  const [service, setService] = useState<google.maps.places.AutocompleteService | null>(null);
  const { isLoaded } = useGoogleMaps();

  useEffect(() => {
    if (isLoaded && window.google?.maps?.places) {
      setService(new google.maps.places.AutocompleteService());
    }
  }, [isLoaded]);

  return service;
}

export function useGeocoderService() {
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const { isLoaded } = useGoogleMaps();

  useEffect(() => {
    if (isLoaded && window.google?.maps) {
      setGeocoder(new google.maps.Geocoder());
    }
  }, [isLoaded]);

  return geocoder;
}
