'use client';

import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { createUserProfile, getUserProfile, updateUserProfile } from '@/lib/firestore';
import type { UserProfile, UserRole } from '@/lib/types';

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  initialized: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, phone: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
  initAuth: () => () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  initialized: false,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      // Mock login for demo accounts
      if (email.endsWith('@demo.com') && password === 'demo123456') {
        const role = email.split('@')[0] as UserRole;
        const mockProfile: UserProfile = {
          uid: `demo_${role}_123`,
          name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
          email,
          phone: '+91 98765 43210',
          role,
          createdAt: new Date(),
        };
        await new Promise(resolve => setTimeout(resolve, 800));
        set({ user: { uid: mockProfile.uid, email } as User, profile: mockProfile, isAuthenticated: true, isLoading: false });
        return;
      }

      const cred = await signInWithEmailAndPassword(auth, email, password);
      const profile = await getUserProfile(cred.user.uid);
      set({ user: cred.user, profile, isAuthenticated: true, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  register: async (email, password, name, phone, role) => {
    set({ isLoading: true, error: null });
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const profile: UserProfile = {
        uid: cred.user.uid,
        name,
        email,
        phone,
        role,
        createdAt: new Date(),
      };
      await createUserProfile(profile);
      set({ user: cred.user, profile, isAuthenticated: true, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await signOut(auth);
      set({ user: null, profile: null, isAuthenticated: false, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      set({ error: message, isLoading: false });
    }
  },

  resetPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await sendPasswordResetEmail(auth, email);
      set({ isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Reset failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  updateProfile: async (data) => {
    const { profile } = get();
    if (!profile) return;
    try {
      await updateUserProfile(profile.uid, data);
      set({ profile: { ...profile, ...data } });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Update failed';
      set({ error: message });
    }
  },

  clearError: () => set({ error: null }),

  initAuth: () => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await getUserProfile(user.uid);
        set({ user, profile, isAuthenticated: true, initialized: true, isLoading: false });
      } else {
        set({ user: null, profile: null, isAuthenticated: false, initialized: true, isLoading: false });
      }
    });
    return unsubscribe;
  },
}));
