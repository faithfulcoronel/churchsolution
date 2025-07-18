import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase, supabaseWrapper } from '../lib/supabase';
import { clearAppCaches } from '../utils/cacheUtils';

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user, loading: false }),
  signOut: async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      // Always clear the user state, even if signOut fails
      set({ user: null, loading: false });
      clearAppCaches();
    }
  },
}));

// Set up auth state listener using the wrapper
supabaseWrapper.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
    // Handle sign out and user deletion
    useAuthStore.getState().setUser(null);
    clearAppCaches();
  } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    // Handle sign in and token refresh
    useAuthStore.getState().setUser(session?.user ?? null);
    clearAppCaches();
  }
});

// Initialize auth state
supabase.auth.getSession().then(({ data: { session } }) => {
  useAuthStore.getState().setUser(session?.user ?? null);
}).catch((error) => {
  console.error('Error getting session:', error);
  useAuthStore.getState().setUser(null);
});