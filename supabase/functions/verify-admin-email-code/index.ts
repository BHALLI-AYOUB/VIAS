import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
  Vary: 'Origin',
};

const ADMIN_EMAILS = new Set([
  'ayoubbhalli2003@gmail.com',
  'mohammedelkamani1@gmail.com',
]);

function normalizeEmail(email = '') {
  return email.trim().toLowerCase();
}

async function sha256(value: string) {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', encoded);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return jsonResponse({ success: true }, 200);
  }

  if (req.method !== 'POST') {
    return jsonResponse(
      {
        success: false,
        error: `Method ${req.method} not allowed. Use POST.`,
      },
      405,
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[verify-admin-email-code] Missing Supabase server credentials.');
      return jsonResponse({ success: false, error: 'Missing Supabase server credentials.' }, 500);
    }

    const authHeader = req.headers.get('Authorization') ?? '';
    const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

    if (!accessToken) {
      return jsonResponse({ success: false, error: 'Missing authenticated admin session.' }, 401);
    }

    let payload: { userId?: string; user_id?: string; email?: string; code?: string } | null = null;

    try {
      payload = await req.json();
    } catch (error) {
      console.error('[verify-admin-email-code] Invalid JSON body.', error);
      return jsonResponse({ success: false, error: 'Invalid JSON request body.' }, 400);
    }

    const userId = payload?.userId ?? payload?.user_id ?? '';
    const normalizedEmail = normalizeEmail(payload?.email ?? '');
    const code = String(payload?.code ?? '').trim();

    if (!userId) {
      return jsonResponse({ success: false, error: 'Missing user_id.' }, 400);
    }

    if (!normalizedEmail) {
      return jsonResponse({ success: false, error: 'Missing email.' }, 400);
    }

    if (!/^\d{6}$/.test(code)) {
      return jsonResponse({ success: false, error: 'Invalid code format.' }, 400);
    }

    if (!ADMIN_EMAILS.has(normalizedEmail)) {
      return jsonResponse({ success: false, error: 'Admin email not allowed.' }, 403);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: authUserData, error: authUserError } = await supabase.auth.getUser(accessToken);

    if (authUserError || !authUserData.user) {
      console.error('[verify-admin-email-code] Unable to validate admin session.', authUserError);
      return jsonResponse({ success: false, error: 'Unable to validate admin session.' }, 401);
    }

    const authenticatedEmail = normalizeEmail(authUserData.user.email ?? '');

    if (authUserData.user.id !== userId || authenticatedEmail !== normalizedEmail) {
      return jsonResponse({ success: false, error: 'Authenticated admin identity does not match the request.' }, 403);
    }

    const nowIso = new Date().toISOString();
    const { data: latestRow, error: readError } = await supabase
      .from('admin_email_verifications')
      .select('id, code_hash, expires_at')
      .eq('user_id', userId)
      .eq('email', normalizedEmail)
      .eq('verified', false)
      .gt('expires_at', nowIso)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (readError) {
      console.error('[verify-admin-email-code] Failed to read verification row.', readError);
      return jsonResponse({ success: false, error: 'Failed to read verification code.' }, 500);
    }

    if (!latestRow) {
      return jsonResponse({ success: false, error: 'Invalid or expired code.' }, 400);
    }

    const providedHash = await sha256(code);

    if (providedHash !== latestRow.code_hash) {
      return jsonResponse({ success: false, error: 'Invalid or expired code.' }, 400);
    }

    const verifiedAt = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('admin_email_verifications')
      .update({
        verified: true,
        verified_at: verifiedAt,
      })
      .eq('id', latestRow.id);

    if (updateError) {
      console.error('[verify-admin-email-code] Failed to update verification row.', updateError);
      return jsonResponse({ success: false, error: 'Failed to validate verification code.' }, 500);
    }

    return jsonResponse(
      {
        success: true,
        message: 'Verification code validated',
        id: latestRow.id,
        expiresAt: latestRow.expires_at,
        verifiedAt,
      },
      200,
    );
  } catch (error) {
    console.error('[verify-admin-email-code] Unexpected error.', error);
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unexpected error',
      },
      500,
    );
  }
});
