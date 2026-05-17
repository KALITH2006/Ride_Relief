import type { ServiceType, PriceBreakdown } from '@/lib/types';

export interface PricingFactors {
  serviceType: ServiceType;
  weatherCondition: 'clear' | 'rain' | 'storm' | 'extreme_heat';
  trafficLevel: 'low' | 'moderate' | 'high' | 'severe';
  activeBookings: number;
  availableProviders: number;
  isSOS: boolean;
  distanceKm?: number;
}

const BASE_PRICES: Record<ServiceType, number> = {
  acting_driver: 300,
  mechanic: 250,
  rental: 500,
  emergency: 700,
};

export const calculateDynamicPrice = (factors: PricingFactors): PriceBreakdown => {
  let basePrice = BASE_PRICES[factors.serviceType];
  
  // Apply distance modifier if applicable (e.g. Acting Driver per km)
  if (factors.distanceKm && factors.distanceKm > 5 && factors.serviceType === 'acting_driver') {
    basePrice += (factors.distanceKm - 5) * 15; // Rs 15 per extra km
  }

  let weatherMultiplier = 1.0;
  let trafficMultiplier = 1.0;
  let demandMultiplier = 1.0;
  let emergencyMultiplier = 1.0;

  // 1. Weather Surge
  switch (factors.weatherCondition) {
    case 'rain': weatherMultiplier = 1.2; break;
    case 'storm': weatherMultiplier = 1.5; break;
    case 'extreme_heat': weatherMultiplier = 1.1; break;
  }

  // 2. Traffic Surge
  switch (factors.trafficLevel) {
    case 'moderate': trafficMultiplier = 1.1; break;
    case 'high': trafficMultiplier = 1.3; break;
    case 'severe': trafficMultiplier = 1.5; break;
  }

  // 3. Demand/Supply Surge
  if (factors.activeBookings > 0 && factors.availableProviders > 0) {
    const ratio = factors.activeBookings / factors.availableProviders;
    if (ratio >= 2) {
      demandMultiplier = 1.5;
    } else if (ratio > 1) {
      demandMultiplier = 1.2;
    }
  } else if (factors.activeBookings > 0 && factors.availableProviders === 0) {
    demandMultiplier = 1.8; // Extreme surge if no providers but demand exists
  }

  // 4. Time-based pricing (check local hour)
  const hour = new Date().getHours();
  // Midnight (12 AM - 5 AM) or Peak Office (8-10 AM, 5-8 PM)
  if (hour >= 0 && hour < 5) {
    demandMultiplier += 0.2;
  } else if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20)) {
    demandMultiplier += 0.15;
  }

  // 5. Emergency SOS priority
  if (factors.isSOS) {
    emergencyMultiplier = 1.5; // Always ensure SOS pays well for priority
  }

  // Final Price Calculation
  const weatherSurgeAmt = (basePrice * weatherMultiplier) - basePrice;
  const trafficSurgeAmt = (basePrice * trafficMultiplier) - basePrice;
  const demandSurgeAmt = (basePrice * demandMultiplier) - basePrice;
  const emergencyFeeAmt = factors.isSOS ? (basePrice * 0.5) : 0; // 50% extra for SOS

  const finalPrice = Math.round(
    basePrice + weatherSurgeAmt + trafficSurgeAmt + demandSurgeAmt + emergencyFeeAmt
  );

  return {
    basePrice: Math.round(basePrice),
    weatherSurge: Math.round(weatherSurgeAmt),
    trafficSurge: Math.round(trafficSurgeAmt),
    demandSurge: Math.round(demandSurgeAmt),
    emergencyFee: Math.round(emergencyFeeAmt),
    finalPrice
  };
};
