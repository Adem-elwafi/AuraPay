import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const getEnvOrStorage = (envKey: string, storageKey: string): string | undefined => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(storageKey);
    if (saved && saved.trim() !== '') return saved.trim();
  }
  return import.meta.env[envKey] as string | undefined;
};

export const getSupabaseConfig = () => {
  const url = getEnvOrStorage('VITE_SUPABASE_URL', 'sw_supabase_url');
  const anonKey = getEnvOrStorage('VITE_SUPABASE_ANON_KEY', 'sw_supabase_anon_key');

  const isConfigured = Boolean(
    url &&
    anonKey &&
    url.trim() !== '' &&
    anonKey.trim() !== '' &&
    !url.includes('VOTRE_SUPABASE_URL') &&
    !anonKey.includes('VOTRE_SUPABASE_ANON_KEY')
  );

  return { url, anonKey, isConfigured };
};

const config = getSupabaseConfig();
export const isSupabaseConfigured = config.isConfigured;

/**
 * Supabase client instance.
 * Returns null if Supabase configuration is missing,
 * allowing the application to safely operate in Offline-First / Local autonomous mode.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(config.url!, config.anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

export const setCustomSupabaseConfig = (url: string, anonKey: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('sw_supabase_url', url.trim());
    localStorage.setItem('sw_supabase_anon_key', anonKey.trim());
    window.location.reload();
  }
};

export const clearCustomSupabaseConfig = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('sw_supabase_url');
    localStorage.removeItem('sw_supabase_anon_key');
    window.location.reload();
  }
};
