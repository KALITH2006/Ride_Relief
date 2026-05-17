import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  onSnapshot,
  Timestamp,
  runTransaction,
  type DocumentData,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';
import type { UserProfile, Booking, Notification, LiveLocation, SOSRequest, TrackingRoom, Provider, DriverStats } from './types';

// ===== Users =====

export async function createUserProfile(profile: UserProfile): Promise<void> {
  await setDoc(doc(db, 'users', profile.uid), {
    ...profile,
    createdAt: Timestamp.fromDate(profile.createdAt),
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    uid: snap.id,
    createdAt: data.createdAt?.toDate?.() || new Date(),
  } as UserProfile;
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
  await updateDoc(doc(db, 'users', uid), data as DocumentData);
}

export async function getAllUsers(role?: string): Promise<UserProfile[]> {
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];
  if (role) constraints.unshift(where('role', '==', role));
  const q = query(collection(db, 'users'), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    ...d.data(),
    uid: d.id,
    createdAt: d.data().createdAt?.toDate?.() || new Date(),
  })) as UserProfile[];
}

// ===== Bookings =====

export async function createBooking(booking: Omit<Booking, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'bookings'), {
    ...booking,
    createdAt: Timestamp.fromDate(booking.createdAt),
  });
  return docRef.id;
}

export async function getBooking(id: string): Promise<Booking | null> {
  const snap = await getDoc(doc(db, 'bookings', id));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    id: snap.id,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.(),
    completedAt: data.completedAt?.toDate?.(),
  } as Booking;
}

export async function updateBooking(id: string, data: Partial<Booking>): Promise<void> {
  const updateData: DocumentData = { ...data, updatedAt: Timestamp.now() };
  if (data.completedAt) updateData.completedAt = Timestamp.fromDate(data.completedAt);
  await updateDoc(doc(db, 'bookings', id), updateData);
}

export async function deleteBooking(id: string): Promise<void> {
  await deleteDoc(doc(db, 'bookings', id));
}

export async function getUserBookings(userId: string): Promise<Booking[]> {
  const q = query(
    collection(db, 'bookings'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    ...d.data(),
    id: d.id,
    createdAt: d.data().createdAt?.toDate?.() || new Date(),
  })) as Booking[];
}

export async function getDriverBookings(driverId: string): Promise<Booking[]> {
  const q = query(
    collection(db, 'bookings'),
    where('driverId', '==', driverId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    ...d.data(),
    id: d.id,
    createdAt: d.data().createdAt?.toDate?.() || new Date(),
  })) as Booking[];
}

export async function getAllBookings(): Promise<Booking[]> {
  const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    ...d.data(),
    id: d.id,
    createdAt: d.data().createdAt?.toDate?.() || new Date(),
  })) as Booking[];
}

export async function getPendingBookings(): Promise<Booking[]> {
  const q = query(
    collection(db, 'bookings'),
    where('status', '==', 'requested'),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    ...d.data(),
    id: d.id,
    createdAt: d.data().createdAt?.toDate?.() || new Date(),
  })) as Booking[];
}

export function subscribeToBookings(
  userId: string,
  field: 'userId' | 'driverId',
  callback: (bookings: Booking[]) => void
) {
  const q = query(
    collection(db, 'bookings'),
    where(field, '==', userId),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  return onSnapshot(q, (snap) => {
    const bookings = snap.docs.map((d) => ({
      ...d.data(),
      id: d.id,
      createdAt: d.data().createdAt?.toDate?.() || new Date(),
    })) as Booking[];
    callback(bookings);
  });
}

// ===== Notifications =====

export async function createNotification(notification: Omit<Notification, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'notifications'), {
    ...notification,
    createdAt: Timestamp.fromDate(notification.createdAt),
  });
  return docRef.id;
}

export async function getUserNotifications(userId: string): Promise<Notification[]> {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    ...d.data(),
    id: d.id,
    createdAt: d.data().createdAt?.toDate?.() || new Date(),
  })) as Notification[];
}

export async function markNotificationRead(id: string): Promise<void> {
  await updateDoc(doc(db, 'notifications', id), { read: true });
}

export function subscribeToNotifications(
  userId: string,
  callback: (notifications: Notification[]) => void
) {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  return onSnapshot(q, (snap) => {
    const notifications = snap.docs.map((d) => ({
      ...d.data(),
      id: d.id,
      createdAt: d.data().createdAt?.toDate?.() || new Date(),
    })) as Notification[];
    callback(notifications);
  });
}

// ===== Live Locations =====

export async function updateLiveLocation(location: LiveLocation): Promise<void> {
  await setDoc(doc(db, 'locations', location.userId), {
    ...location,
    updatedAt: Timestamp.fromDate(location.updatedAt),
  });
}

export async function getLiveLocation(userId: string): Promise<LiveLocation | null> {
  const snap = await getDoc(doc(db, 'locations', userId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    userId: snap.id,
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
  } as LiveLocation;
}

export function subscribeToLiveLocation(
  userId: string,
  callback: (location: LiveLocation | null) => void
) {
  return onSnapshot(doc(db, 'locations', userId), (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    const data = snap.data();
    callback({
      ...data,
      userId: snap.id,
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as LiveLocation);
  });
}

export async function getNearbyProviders(
  lat: number,
  lng: number,
  role: LiveLocation['role']
): Promise<LiveLocation[]> {
  const q = query(
    collection(db, 'locations'),
    where('role', '==', role),
    where('isOnline', '==', true)
  );
  const snap = await getDocs(q);
  const locations = snap.docs.map((d) => ({
    ...d.data(),
    userId: d.id,
    updatedAt: d.data().updatedAt?.toDate?.() || new Date(),
  })) as LiveLocation[];

  // Client-side distance filter (~10km radius using simple bounding box)
  const RADIUS_DEG = 0.09; // ~10km
  return locations.filter(
    (loc) =>
      Math.abs(loc.lat - lat) <= RADIUS_DEG &&
      Math.abs(loc.lng - lng) <= RADIUS_DEG
  );
}

export async function getAllOnlineProviders(): Promise<LiveLocation[]> {
  const q = query(
    collection(db, 'locations'),
    where('isOnline', '==', true)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    ...d.data(),
    userId: d.id,
    updatedAt: d.data().updatedAt?.toDate?.() || new Date(),
  })) as LiveLocation[];
}

export function subscribeToAllOnlineProviders(
  callback: (locations: LiveLocation[]) => void
) {
  const q = query(
    collection(db, 'locations'),
    where('isOnline', '==', true)
  );
  return onSnapshot(q, (snap) => {
    const locations = snap.docs.map((d) => ({
      ...d.data(),
      userId: d.id,
      updatedAt: d.data().updatedAt?.toDate?.() || new Date(),
    })) as LiveLocation[];
    callback(locations);
  });
}


// ===== Tracking Rooms =====

export async function createTrackingRoom(room: Omit<TrackingRoom, 'id' | 'updatedAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'trackingRooms'), {
    ...room,
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateTrackingRoom(id: string, data: Partial<TrackingRoom>): Promise<void> {
  await updateDoc(doc(db, 'trackingRooms', id), {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export function subscribeToTrackingRoom(bookingId: string, callback: (room: TrackingRoom | null) => void) {
  const q = query(collection(db, 'trackingRooms'), where('bookingId', '==', bookingId), limit(1));
  return onSnapshot(q, (snap) => {
    if (snap.empty) {
      callback(null);
      return;
    }
    const d = snap.docs[0];
    const data = d.data();
    callback({
      ...data,
      id: d.id,
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
    } as TrackingRoom);
  });
}

// ===== SOS Requests =====

export async function createSOSRequest(request: Omit<SOSRequest, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'sosRequests'), {
    ...request,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateSOSRequest(id: string, data: Partial<SOSRequest>): Promise<void> {
  await updateDoc(doc(db, 'sosRequests', id), data);
}

export function subscribeToSOSRequests(callback: (requests: SOSRequest[]) => void) {
  const q = query(collection(db, 'sosRequests'), where('status', '==', 'searching'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const requests = snap.docs.map(d => ({
      ...d.data(),
      id: d.id,
      createdAt: d.data().createdAt?.toDate?.() || new Date(),
    })) as SOSRequest[];
    callback(requests);
  });
}

// ===== Utility: Haversine Distance Matcher =====

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180);
}

export async function findNearestProvider(lat: number, lng: number, serviceType: string, radiusKm = 10): Promise<LiveLocation | null> {
  // Get all online providers
  const q = query(collection(db, 'locations'), where('isOnline', '==', true), where('role', '==', serviceType));
  const snap = await getDocs(q);
  const locations = snap.docs.map((d) => ({
    ...d.data(),
    userId: d.id,
    updatedAt: d.data().updatedAt?.toDate?.() || new Date(),
  })) as LiveLocation[];

  let nearestProvider: LiveLocation | null = null;
  let minDistance = radiusKm;

  for (const loc of locations) {
    if ((loc as any).isBusy) continue;
    
    const dist = getDistanceFromLatLonInKm(lat, lng, loc.lat, loc.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearestProvider = loc;
    }
  }

  return nearestProvider;
}

// ===== OTP Verification =====

export async function verifyOTP(bookingId: string, enteredOTP: string): Promise<boolean> {
  const booking = await getBooking(bookingId);
  if (booking && booking.otp === enteredOTP) {
    await updateBooking(bookingId, { otpVerified: true });
    return true;
  }
  return false;
}

// ===== Driver Analytics & Earnings =====

export function subscribeToDriverStats(driverId: string, callback: (stats: DriverStats | null) => void) {
  return onSnapshot(doc(db, 'driverStats', driverId), (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    const data = snap.data();
    callback({
      ...data,
      driverId: snap.id,
    } as DriverStats);
  });
}

export async function updateDriverStatsOnCompletion(driverId: string, fare: number, isSOS: boolean): Promise<void> {
  const statRef = doc(db, 'driverStats', driverId);

  try {
    await runTransaction(db, async (transaction) => {
      const sfDoc = await transaction.get(statRef);
      if (!sfDoc.exists()) {
        // Initialize if it doesn't exist
        transaction.set(statRef, {
          driverId,
          totalTrips: 1,
          todayTrips: 1,
          todayEarnings: fare,
          weeklyEarnings: fare,
          monthlyEarnings: fare,
          completedSOS: isSOS ? 1 : 0,
          rating: 5.0, // Default start rating
        });
      } else {
        const data = sfDoc.data() as DriverStats;
        transaction.update(statRef, {
          totalTrips: (data.totalTrips || 0) + 1,
          todayTrips: (data.todayTrips || 0) + 1,
          todayEarnings: (data.todayEarnings || 0) + fare,
          weeklyEarnings: (data.weeklyEarnings || 0) + fare,
          monthlyEarnings: (data.monthlyEarnings || 0) + fare,
          completedSOS: (data.completedSOS || 0) + (isSOS ? 1 : 0),
        });
      }
    });
  } catch (e) {
    console.error('Transaction failed: ', e);
  }
}

