// RideRelief Type Definitions

export type UserRole = 'customer' | 'driver' | 'admin';

export type ServiceType = 'acting_driver' | 'rental' | 'mechanic' | 'emergency';

export type BookingStatus = 'requested' | 'assigned' | 'on_the_way' | 'arrived' | 'completed' | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed';

export type Priority = 'normal' | 'high' | 'emergency';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  isOnline?: boolean;
  fcmToken?: string;
  savedAddresses?: SavedAddress[];
  avatar?: string;
  city?: string;
  createdAt: Date;
}

export interface SavedAddress {
  id: string;
  label: string;
  address: string;
  lat: number;
  lng: number;
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface LiveLocation {
  userId: string;
  role: 'driver' | 'mechanic' | 'rental_car' | 'customer';
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  updatedAt: Date;
  isOnline: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  userName?: string;
  userPhone?: string;
  driverId: string | null;
  driverName?: string;
  serviceType: ServiceType;
  status: BookingStatus;
  pickup: Location;
  drop: Location | null;
  amount: number;
  paymentStatus: PaymentStatus;
  isSOS: boolean;
  priority: Priority;
  customerPhone: string;
  rating: number | null;
  notes: string;
  eta?: number;
  distance?: number;
  createdAt: Date;
  updatedAt?: Date;
  completedAt?: Date;
  otp?: string;
  otpVerified?: boolean;
  otpExpiresAt?: Date;
  trackingRoomId?: string;
  priceBreakdown?: PriceBreakdown;
  city?: string;
}

export interface SOSRequest {
  id?: string;
  customerId: string;
  bookingId?: string;
  serviceType: 'SOS';
  location: { lat: number; lng: number };
  status: 'searching' | 'assigned' | 'resolved';
  priority: 'high';
  createdAt: Date;
}

export interface TrackingRoom {
  id?: string;
  bookingId: string;
  customerId: string;
  providerId: string | null;
  customerLocation: { lat: number; lng: number } | null;
  providerLocation: { lat: number; lng: number } | null;
  status: BookingStatus;
  eta?: string;
  distance?: string;
  routePolyline?: string;
  serviceType: ServiceType | 'SOS';
  updatedAt: Date;
}

export interface ChatMessage {
  id?: string;
  senderId: string;
  message: string;
  createdAt: Date;
}

export interface Provider {
  uid: string;
  role: 'driver' | 'mechanic' | 'rental_car';
  isOnline: boolean;
  isBusy: boolean;
  currentLocation: { lat: number; lng: number } | null;
  serviceTypes: ServiceType[];
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'sos' | 'system';
  read: boolean;
  createdAt: Date;
}

export interface DriverEarnings {
  daily: number;
  weekly: number;
  monthly: number;
  total: number;
  trips: number;
}

export interface AdminStats {
  totalBookings: number;
  totalUsers: number;
  totalDrivers: number;
  totalRevenue: number;
  activeJobs: number;
  sosJobs: number;
  completionRate: number;
}

export interface PricingConfig {
  serviceType: ServiceType;
  baseFare: number;
  perKm: number;
  perMinute: number;
  minimumFare: number;
  surgeFactor: number;
}

export interface PriceBreakdown {
  basePrice: number;
  trafficSurge: number;
  weatherSurge: number;
  demandSurge: number;
  emergencyFee: number;
  finalPrice: number;
}

export interface DriverStats {
  driverId: string;
  totalTrips: number;
  todayTrips: number;
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  completedSOS: number;
  rating: number;
}

export const SERVICE_LABELS: Record<ServiceType, string> = {
  acting_driver: 'Acting Driver',
  rental: 'Rental Vehicle',
  mechanic: 'Mechanic',
  emergency: 'Emergency',
};

export const STATUS_LABELS: Record<BookingStatus, string> = {
  requested: 'Requested',
  assigned: 'Assigned',
  on_the_way: 'On The Way',
  arrived: 'Arrived',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const STATUS_CLASSES: Record<BookingStatus | 'sos', string> = {
  requested: 'status-requested',
  assigned: 'status-assigned',
  on_the_way: 'status-ontheway',
  arrived: 'status-arrived',
  completed: 'status-completed',
  cancelled: 'status-cancelled',
  sos: 'status-sos',
};
