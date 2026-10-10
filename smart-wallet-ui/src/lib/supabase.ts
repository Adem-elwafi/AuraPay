import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Read environment variables (Vite prefix)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.trim() !== '' &&
  supabaseAnonKey.trim() !== '' &&
  !supabaseUrl.includes('VOTRE_SUPABASE_URL') &&
  !supabaseAnonKey.includes('VOTRE_SUPABASE_ANON_KEY')
);

/**
 * Supabase client instance.
 * Returns null if Supabase environment variables are missing,
 * allowing the application to safely operate in Offline-First / Local autonomous mode.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
