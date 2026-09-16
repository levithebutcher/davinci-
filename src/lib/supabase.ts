import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your-project-id') &&
    !supabaseAnonKey.includes('your_supabase_anon_key')
  );
};

// Fallback dummy URL to prevent createClient throwing on unconfigured initialization
const safeUrl = isSupabaseConfigured() ? supabaseUrl! : 'https://placeholder.supabase.co';
const safeKey = isSupabaseConfigured() ? supabaseAnonKey! : 'placeholder-anon-key';

export const supabase: SupabaseClient<any> = createClient<any>(safeUrl, safeKey);
