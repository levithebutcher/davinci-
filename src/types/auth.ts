import type { User } from '@supabase/supabase-js';
import type { DbProfile } from './database';

export type UserRole = 'student' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
}

export function mapDbProfileToUserProfile(db: DbProfile): UserProfile {
  return {
    id: db.id,
    email: db.email,
    role: db.role,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}
