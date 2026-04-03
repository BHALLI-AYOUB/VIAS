import { createClient } from '@supabase/supabase-js';

const { VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY } = import.meta.env;

export const isSupabaseConfigured = Boolean(VITE_SUPABASE_URL && VITE_SUPABASE_ANON_KEY);

const supabase = isSupabaseConfigured
  ? createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function getSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  return supabase;
}

export async function testSupabaseConnection(tableName = 'machines') {
  if (!isSupabaseConfigured) {
    console.warn('[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.');
    return { ok: false, data: null, error: new Error('Supabase is not configured.') };
  }

  try {
    const client = getSupabaseClient();
    const { data, error } = await client.from(tableName).select('*').limit(1);

    if (error) {
      console.error(`[Supabase] Connection test failed for table "${tableName}".`, error);
      return { ok: false, data: null, error };
    }

    console.info(`[Supabase] Connection test succeeded for table "${tableName}".`, data);
    return { ok: true, data: data || [], error: null };
  } catch (error) {
    console.error('[Supabase] Unexpected connection test error.', error);
    return { ok: false, data: null, error };
  }
}

export { supabase };
