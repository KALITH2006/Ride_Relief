export interface ETAPredictionParams {
  distanceKm: number;
  weatherCondition: 'clear' | 'rain' | 'storm';
  trafficLevel: 'low' | 'moderate' | 'high' | 'severe';
  timeOfDay: number; // 0-23
  historicalAvgSpeedKmh?: number;
}

export function predictETA({
  distanceKm,
  weatherCondition,
  trafficLevel,
  timeOfDay,
  historicalAvgSpeedKmh = 30 // Default city average speed
}: ETAPredictionParams): { minutes: number; confidence: number } {
  let expectedSpeed = historicalAvgSpeedKmh;

  // 1. Adjust for Traffic Level
  const trafficMultipliers = {
    low: 1.1,       // 10% faster
    moderate: 0.9,  // 10% slower
    high: 0.6,      // 40% slower
    severe: 0.3     // 70% slower
  };
  expectedSpeed *= trafficMultipliers[trafficLevel];

  // 2. Adjust for Weather
  const weatherMultipliers = {
    clear: 1.0,
    rain: 0.8,
    storm: 0.6
  };
  expectedSpeed *= weatherMultipliers[weatherCondition];

  // 3. Time of Day Adjustment (e.g., Midnight runs faster)
  if (timeOfDay >= 23 || timeOfDay <= 4) {
    expectedSpeed *= 1.2; // 20% faster at night empty roads
  } else if ((timeOfDay >= 8 && timeOfDay <= 10) || (timeOfDay >= 17 && timeOfDay <= 19)) {
    expectedSpeed *= 0.8; // Peak hours slow down further
  }

  // Safety bounds
  expectedSpeed = Math.max(10, Math.min(expectedSpeed, 60)); // Between 10 and 60 km/h

  // Calculate ETA in minutes
  const etaHours = distanceKm / expectedSpeed;
  const etaMinutes = Math.ceil(etaHours * 60);

  // Confidence is lower in severe weather or extreme traffic
  let confidence = 0.95;
  if (trafficLevel === 'severe') confidence -= 0.2;
  if (weatherCondition === 'storm') confidence -= 0.2;

  return {
    minutes: Math.max(1, etaMinutes), // Minimum 1 min
    confidence: Math.max(0.4, confidence)
  };
}
