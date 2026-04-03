import { isAllowedAdminEmail, normalizeAdminEmail } from '../config/admins';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabaseClient';

function getUserEmail(user) {
  return normalizeAdminEmail(user?.email || user?.user_metadata?.email || '');
}

export async function getSession() {
  if (!isSupabaseConfigured) {
    return null;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error('[authService.getSession] Failed to fetch session.', error);
    throw error;
  }

  return data.session;
}

export async function signInWithPassword(email, password) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error('[authService.signInWithPassword] Sign-in failed.', error);
    throw error;
  }

  return data;
}

export async function signOut() {
  if (!isSupabaseConfigured) {
    return;
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('[authService.signOut] Sign-out failed.', error);
    throw error;
  }
}

export function subscribeToAuthChanges(callback) {
  const supabase = getSupabaseClient();
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

export function isAdminUser(user) {
  return isAllowedAdminEmail(getUserEmail(user));
}

export function getAdminEmail(user) {
  return getUserEmail(user);
}
