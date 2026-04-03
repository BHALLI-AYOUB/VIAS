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

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
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
    const resendApiKey = Deno.env.get('RESEND_API_KEY') ?? '';
    const fromEmail = Deno.env.get('ADMIN_VERIFICATION_FROM_EMAIL') ?? '';

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('[send-admin-verification-code] Missing Supabase server credentials.');
      return jsonResponse(
        {
          success: false,
          error: 'Missing Supabase server credentials.',
        },
        500,
      );
    }

    if (!resendApiKey || !fromEmail) {
      console.error('[send-admin-verification-code] Missing email provider configuration.');
      return jsonResponse(
        {
          success: false,
          error: 'Missing email provider configuration.',
        },
        500,
      );
    }

    const authHeader = req.headers.get('Authorization') ?? '';
    const accessToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

    if (!accessToken) {
      return jsonResponse(
        {
          success: false,
          error: 'Missing authenticated admin session.',
        },
        401,
      );
    }

    let payload: { userId?: string; user_id?: string; email?: string } | null = null;

    try {
      payload = await req.json();
    } catch (error) {
      console.error('[send-admin-verification-code] Invalid JSON body.', error);
      return jsonResponse(
        {
          success: false,
          error: 'Invalid JSON request body.',
        },
        400,
      );
    }

    const userId = payload?.userId ?? payload?.user_id ?? '';
    const normalizedEmail = normalizeEmail(payload?.email ?? '');

    if (!userId) {
      return jsonResponse(
        {
          success: false,
          error: 'Missing user_id.',
        },
        400,
      );
    }

    if (!normalizedEmail) {
      return jsonResponse(
        {
          success: false,
          error: 'Missing email.',
        },
        400,
      );
    }

    if (!ADMIN_EMAILS.has(normalizedEmail)) {
      return jsonResponse(
        {
          success: false,
          error: 'Admin email not allowed.',
        },
        403,
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: authUserData, error: authUserError } = await supabase.auth.getUser(accessToken);

    if (authUserError || !authUserData.user) {
      console.error('[send-admin-verification-code] Unable to validate admin session.', authUserError);
      return jsonResponse(
        {
          success: false,
          error: 'Unable to validate admin session.',
        },
        401,
      );
    }

    const authenticatedEmail = normalizeEmail(authUserData.user.email ?? '');

    if (authUserData.user.id !== userId || authenticatedEmail !== normalizedEmail) {
      return jsonResponse(
        {
          success: false,
          error: 'Authenticated admin identity does not match the request.',
        },
        403,
      );
    }

    const code = generateCode();
    const codeHash = await sha256(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: deleteError } = await supabase
      .from('admin_email_verifications')
      .delete()
      .eq('user_id', userId)
      .eq('email', normalizedEmail)
      .eq('verified', false);

    if (deleteError) {
      console.error('[send-admin-verification-code] Failed to clear previous pending codes.', deleteError);
      return jsonResponse(
        {
          success: false,
          error: 'Failed to clear previous pending codes.',
        },
        500,
      );
    }

    const { error: insertError } = await supabase.from('admin_email_verifications').insert({
      user_id: userId,
      email: normalizedEmail,
      code_hash: codeHash,
      expires_at: expiresAt,
      verified: false,
    });

    if (insertError) {
      console.error('[send-admin-verification-code] Failed to store verification code.', insertError);
      return jsonResponse(
        {
          success: false,
          error: 'Failed to store verification code.',
        },
        500,
      );
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [normalizedEmail],
        subject: 'Code de verification admin VIAS',
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6">
            <h2>Verification admin VIAS</h2>
            <p>Votre code de verification admin est :</p>
            <div style="font-size:32px;font-weight:700;letter-spacing:6px">${code}</div>
            <p>Ce code expire dans 10 minutes.</p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const emailError = await emailResponse.text();
      console.error('[send-admin-verification-code] Email provider returned an error.', emailError);
      return jsonResponse(
        {
          success: false,
          error: 'Failed to send verification email.',
        },
        500,
      );
    }

    return jsonResponse(
      {
        success: true,
        message: 'Verification code sent',
        expiresAt,
      },
      200,
    );
  } catch (error) {
    console.error('[send-admin-verification-code] Unexpected error.', error);
    return jsonResponse(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unexpected error',
      },
      500,
    );
  }
});
