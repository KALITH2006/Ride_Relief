'use client';

import { create } from 'zustand';
import type { TrackingRoom, ChatMessage, BookingStatus } from '@/lib/types';
import {
  subscribeToTrackingRoom,
  updateTrackingRoomLocation,
  subscribeToChat,
  sendChatMessage,
  updateTrackingRoom
} from '@/lib/firestore';

interface TrackingState {
  roomId: string | null;
  room: TrackingRoom | null;
  messages: ChatMessage[];
  isLoading: boolean;
  unsubRoom: (() => void) | null;
  unsubChat: (() => void) | null;

  // Actions
  joinRoom: (bookingId: string) => void;
  leaveRoom: () => void;
  updateMyLiveLocation: (role: 'customer' | 'provider', lat: number, lng: number) => Promise<void>;
  sendMessage: (senderId: string, message: string) => Promise<void>;
  updateETA: (eta: string, distance: string, polyline?: string) => Promise<void>;
}

export const useTrackingStore = create<TrackingState>((set, get) => ({
  roomId: null,
  room: null,
  messages: [],
  isLoading: false,
  unsubRoom: null,
  unsubChat: null,

  joinRoom: (bookingId) => {
    const currentUnsubRoom = get().unsubRoom;
    const currentUnsubChat = get().unsubChat;
    
    if (currentUnsubRoom) currentUnsubRoom();
    if (currentUnsubChat) currentUnsubChat();

    set({ isLoading: true, roomId: bookingId });

    const unsubRoom = subscribeToTrackingRoom(bookingId, (room) => {
      set({ room, isLoading: false });
    });

    const unsubChat = subscribeToChat(bookingId, (messages) => {
      set({ messages });
    });

    set({ unsubRoom, unsubChat });
  },

  leaveRoom: () => {
    const { unsubRoom, unsubChat } = get();
    if (unsubRoom) unsubRoom();
    if (unsubChat) unsubChat();
    set({ roomId: null, room: null, messages: [], unsubRoom: null, unsubChat: null });
  },

  updateMyLiveLocation: async (role, lat, lng) => {
    const { roomId } = get();
    if (!roomId) return;
    await updateTrackingRoomLocation(roomId, role, { lat, lng });
  },

  sendMessage: async (senderId, message) => {
    const { roomId } = get();
    if (!roomId || !message.trim()) return;
    await sendChatMessage(roomId, { senderId, message });
  },

  updateETA: async (eta, distance, polyline) => {
    const { room } = get();
    if (!room?.id) return;
    
    const updateData: Partial<TrackingRoom> = { eta, distance };
    if (polyline) updateData.routePolyline = polyline;
    
    await updateTrackingRoom(room.id, updateData);
  }
}));
