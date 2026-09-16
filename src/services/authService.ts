import { supabase } from '../lib/supabase';
import type { UserProfile } from '../types/auth';
import { mapDbProfileToUserProfile } from '../types/auth';
import type { DbProfile } from '../types/database';

export const authService = {
  /**
   * Sign in with email and password
   */
  async signInWithPassword(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Sign out the current authenticated user
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  },

  /**
   * Get the active session
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('[authService] Error getting session:', error.message);
      return null;
    }
    return data.session;
  },

  /**
   * Get the current authenticated user
   */
  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      return null;
    }
    return data.user;
  },

  /**
   * Get profile for a specific user ID
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Row might not exist if created outside trigger or waiting
        console.warn('[authService] Profile fetch notice:', error.message);
        return null;
      }

      return mapDbProfileToUserProfile(data as DbProfile);
    } catch (err) {
      console.error('[authService] Failed to load profile:', err);
      return null;
    }
  },
};
