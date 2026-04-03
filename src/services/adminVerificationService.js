import { isAllowedAdminEmail, normalizeAdminEmail } from '../config/admins';
import { getSupabaseClient } from '../lib/supabaseClient';

const SESSION_KEY = 'vias-admin-email-verification';
const CODE_LENGTH = 6;

function getStoredVerification() {
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredVerification(value) {
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(value));
}

export function clearStoredAdminVerification() {
  window.sessionStorage.removeItem(SESSION_KEY);
}

export function getStoredAdminVerification() {
  return getStoredVerification();
}

function mapFunctionError(error) {
  const contextError =
    error?.context?.error ||
    error?.context?.body?.error ||
    error?.context?.data?.error ||
    error?.context?.message;

  if (contextError) {
    return new Error(String(contextError));
  }

  if (error?.name === 'FunctionsFetchError') {
    return new Error('admin-verification-service-unavailable');
  }

  if (error?.name === 'FunctionsHttpError') {
    return new Error('admin-verification-request-failed');
  }

  return error;
}

export async function requestAdminVerificationCode({ userId, email }) {
  const normalizedEmail = normalizeAdminEmail(email);

  if (!isAllowedAdminEmail(normalizedEmail)) {
    throw new Error('admin-not-allowed');
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke('send-admin-verification-code', {
    body: {
      userId,
      email: normalizedEmail,
    },
  });

  if (error) {
    console.error('[adminVerificationService.requestAdminVerificationCode] Failed to send code.', error);
    throw mapFunctionError(error);
  }

  clearStoredAdminVerification();

  return {
    expiresAt: data?.expiresAt ?? null,
  };
}

export async function verifyAdminEmailCode({ userId, email, code }) {
  const normalizedEmail = normalizeAdminEmail(email);
  const trimmedCode = String(code).trim();

  if (!/^\d{6}$/.test(trimmedCode)) {
    throw new Error('invalid-code-format');
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase.functions.invoke('verify-admin-email-code', {
    body: {
      userId,
      email: normalizedEmail,
      code: trimmedCode,
    },
  });

  if (error) {
    console.error('[adminVerificationService.verifyAdminEmailCode] Failed to verify code.', error);

    if (error?.name === 'FunctionsHttpError') {
      throw new Error('invalid-or-expired-code');
    }

    throw mapFunctionError(error);
  }

  const verification = {
    id: data?.id,
    expiresAt: data?.expiresAt,
    verifiedAt: data?.verifiedAt,
  };

  setStoredVerification({
    id: verification.id,
    userId,
    email: normalizedEmail,
    expiresAt: verification.expiresAt,
    verifiedAt: verification.verifiedAt,
  });

  return verification;
}

export async function validateStoredAdminVerification({ userId, email }) {
  const stored = getStoredVerification();
  const normalizedEmail = normalizeAdminEmail(email);

  if (!stored || stored.userId !== userId || stored.email !== normalizedEmail) {
    return null;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('admin_email_verifications')
    .select('*')
    .eq('id', stored.id)
    .eq('user_id', userId)
    .eq('email', normalizedEmail)
    .eq('verified', true)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (error) {
    console.error('[adminVerificationService.validateStoredAdminVerification] Failed to validate stored verification.', error);
    throw error;
  }

  if (!data) {
    clearStoredAdminVerification();
    return null;
  }

  return {
    id: data.id,
    expiresAt: data.expires_at,
    verifiedAt: data.verified_at,
  };
}

export function formatVerificationExpiry(expiresAt, locale = 'fr-FR') {
  if (!expiresAt) {
    return '';
  }

  return new Date(expiresAt).toLocaleString(locale);
}

export function getVerificationCodeLength() {
  return CODE_LENGTH;
}
