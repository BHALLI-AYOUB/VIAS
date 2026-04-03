import { useMemo, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import AuthLoadingScreen from '../components/auth/AuthLoadingScreen';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import { formatVerificationExpiry, getVerificationCodeLength } from '../services/adminVerificationService';

/* ─── OTP input: one box per digit ─────────────────────────── */
function OtpInput({ length, value, onChange, hasError }) {
  const refs = useRef([]);

  const digits = Array.from({ length }, (_, i) => value[i] || '');

  const handleKey = (e, index) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits];
        next[index] = '';
        onChange(next.join(''));
      } else if (index > 0) {
        refs.current[index - 1]?.focus();
        const next = [...digits];
        next[index - 1] = '';
        onChange(next.join(''));
      }
      return;
    }
    if (e.key === 'ArrowLeft' && index > 0)  { refs.current[index - 1]?.focus(); return; }
    if (e.key === 'ArrowRight' && index < length - 1) { refs.current[index + 1]?.focus(); return; }
  };

  const handleChange = (e, index) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) return;
    // allow paste of full code
    if (raw.length > 1) {
      const trimmed = raw.slice(0, length);
      onChange(trimmed);
      refs.current[Math.min(trimmed.length, length - 1)]?.focus();
      return;
    }
    const next = [...digits];
    next[index] = raw[raw.length - 1];
    onChange(next.join(''));
    if (index < length - 1) refs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pasted);
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div className="otp-row" style={{ gap: length > 6 ? 6 : 10 }}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={length}          /* allows paste on first box */
          value={digits[i]}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKey(e, i)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className={`otp-box ${hasError ? 'otp-error' : ''} ${digits[i] ? 'otp-filled' : ''}`}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
}

/* ─── main page ─────────────────────────────────────────────── */
function AdminVerifyEmailCodePage() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { t, isRTL, locale } = useLanguage();
  const {
    isAuthenticated, isAdmin, isEmailVerifiedAdmin,
    verificationInfo, verifyAdminCode, resendAdminCode,
    logout, adminEmail, isAuthLoading,
  } = useAuth();

  const codeLength = getVerificationCodeLength();
  const [code, setCode]       = useState('');
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [resending, setResending] = useState(false);

  const expiresLabel = useMemo(
    () => formatVerificationExpiry(verificationInfo?.expiresAt, locale),
    [verificationInfo?.expiresAt, locale],
  );

  if (isAuthLoading && !adminEmail) {
    return <AuthLoadingScreen title={t('auth.emailCode.title')} description={t('auth.emailCode.description')} />;
  }
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }
  if (isEmailVerifiedAdmin) {
    return <Navigate to={location.state?.from?.pathname || '/historique'} replace />;
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (code.trim().length < codeLength) {
      setError(t('auth.emailCode.validation'));
      return;
    }
    try {
      await verifyAdminCode(code.trim());
      setSuccess(t('auth.emailCode.success'));
      navigate(location.state?.from?.pathname || '/historique', { replace: true });
    } catch (err) {
      if (err.message === 'invalid-or-expired-code') { setError(t('auth.emailCode.invalidOrExpired')); return; }
      if (err.message === 'invalid-code-format')      { setError(t('auth.emailCode.validation')); return; }
      setError(err.message || t('auth.emailCode.error'));
    }
  };

  const handleResend = async () => {
    setError(''); setSuccess(''); setResending(true);
    try {
      await resendAdminCode();
      setSuccess(t('auth.emailCode.resent'));
    } catch (err) {
      if (err.message === 'admin-verification-service-unavailable') { setError(t('auth.emailCode.serviceUnavailable')); }
      else setError(err.message || t('auth.emailCode.resendError'));
    } finally {
      setResending(false);
    }
  };

  const isComplete = code.length === codeLength;

  return (
    <div className={`verify-root min-h-screen ${isRTL ? 'text-right' : 'text-left'}`}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=DM+Sans:wght@400;500&display=swap');

        .verify-root {
          font-family: 'DM Sans', sans-serif;
          background: #f4f5f9;
        }
        .verify-root .sora { font-family: 'Sora', sans-serif; }

        /* same split bg as login page — visual consistency */
        .verify-bg {
          position: fixed; inset: 0; z-index: 0;
          background: linear-gradient(160deg, #0f172a 0%, #1e3a5f 45%, #f4f5f9 45%);
        }
        @media (max-width: 640px) {
          .verify-bg { background: linear-gradient(170deg, #0f172a 0%, #1e3a5f 38%, #f4f5f9 38%); }
        }
        .blob {
          position: fixed; top: -60px; right: -60px;
          width: 260px; height: 260px; border-radius: 50%;
          background: radial-gradient(circle, rgba(96,165,250,0.18) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }

        /* card */
        .verify-card {
          position: relative; z-index: 1;
          background: #fff;
          border-radius: 28px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.07), 0 20px 60px -10px rgba(15,23,42,0.18);
        }

        /* ── OTP boxes ── */
        .otp-row {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
        }
        .otp-box {
          width: 48px; height: 56px;
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          background: #f8fafc;
          text-align: center;
          font-family: 'Sora', sans-serif;
          font-size: 22px;
          font-weight: 600;
          color: #0f172a;
          outline: none;
          caret-color: transparent;
          transition: border-color 0.18s, background 0.18s, box-shadow 0.18s, transform 0.12s;
          -webkit-appearance: none;
        }
        @media (max-width: 380px) {
          .otp-box { width: 40px; height: 50px; font-size: 18px; border-radius: 12px; }
        }
        .otp-box:focus {
          border-color: #0f172a;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(15,23,42,0.1);
          transform: scale(1.06);
        }
        .otp-box.otp-filled {
          border-color: #334155;
          background: #fff;
        }
        .otp-box.otp-error {
          border-color: #fca5a5;
          background: #fff5f5;
        }

        /* submit */
        .btn-primary {
          width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: #0f172a;
          color: #fff; border: none;
          border-radius: 14px;
          padding: 14px 24px;
          font-size: 14px; font-weight: 600;
          font-family: 'Sora', sans-serif;
          cursor: pointer;
          transition: background 0.18s, transform 0.12s, box-shadow 0.18s, opacity 0.18s;
          -webkit-tap-highlight-color: transparent;
        }
        .btn-primary:hover:not(:disabled) {
          background: #1e293b;
          box-shadow: 0 8px 24px -4px rgba(15,23,42,0.35);
        }
        .btn-primary:active:not(:disabled)  { transform: scale(0.975); }
        .btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

        .btn-secondary {
          flex: 1;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          padding: 12px 16px;
          font-size: 13px; font-weight: 600;
          color: #475569;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, transform 0.12s;
          -webkit-tap-highlight-color: transparent;
        }
        .btn-secondary:hover:not(:disabled) { background: #f1f5f9; border-color: #cbd5e1; }
        .btn-secondary:active:not(:disabled) { transform: scale(0.975); }
        .btn-secondary:disabled { opacity: 0.45; cursor: not-allowed; }

        /* spinner */
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }
        .spinner-dark {
          width: 14px; height: 14px;
          border: 2px solid rgba(71,85,105,0.25);
          border-top-color: #475569;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        /* progress bar */
        .otp-progress-track {
          height: 3px;
          background: #e2e8f0;
          border-radius: 99px;
          overflow: hidden;
          margin-top: 12px;
        }
        .otp-progress-fill {
          height: 100%;
          border-radius: 99px;
          background: #0f172a;
          transition: width 0.18s ease;
        }

        /* shake */
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-5px); }
          40%      { transform: translateX(5px); }
          60%      { transform: translateX(-4px); }
          80%      { transform: translateX(4px); }
        }
        .error-shake { animation: shake 0.35s ease; }

        /* success pulse dot */
        @keyframes ping {
          75%,100% { transform: scale(2); opacity: 0; }
        }
        .ping { animation: ping 1s cubic-bezier(0,0,0.2,1) infinite; }

        /* email chip */
        .email-chip {
          display: inline-flex; align-items: center; gap: 6px;
          background: #f1f5f9; border: 1px solid #e2e8f0;
          border-radius: 99px;
          padding: 4px 12px 4px 8px;
          font-size: 13px; font-weight: 500; color: #334155;
          max-width: 100%;
        }
        .email-chip span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      `}</style>

      <div className="verify-bg" />
      <div className="blob" />

      <div className="relative z-10">
        <Header />
      </div>

      <main className="relative z-10 flex min-h-[calc(100vh-64px)] flex-col items-center justify-start px-4 pb-12 pt-8 sm:justify-center sm:pt-4">
        <div className="w-full max-w-sm sm:max-w-md">

          {/* top icon + badge */}
          <div className="mb-5 flex flex-col items-center gap-2 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-sm">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <span className="sora inline-flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-200">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              {t('auth.emailCode.badge') || 'Vérification e-mail'}
            </span>
          </div>

          {/* card */}
          <div className="verify-card px-6 py-8 sm:px-8">

            {/* header */}
            <div className="mb-5">
              <h1 className="sora text-2xl font-bold text-slate-900 sm:text-3xl">
                {t('auth.emailCode.title') || 'Code de vérification'}
              </h1>
              <p className="mt-1.5 text-sm leading-6 text-slate-500">
                {t('auth.emailCode.description') || 'Un code a été envoyé à'}
              </p>
              {adminEmail && (
                <div className="mt-2">
                  <span className="email-chip">
                    <svg className="h-3.5 w-3.5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                    <span>{adminEmail}</span>
                  </span>
                </div>
              )}
            </div>

            {/* expiry info */}
            {expiresLabel && (
              <div className="mb-5 flex items-center gap-2.5 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  {t('auth.emailCode.expiresAt', { value: expiresLabel }) || `Expire à ${expiresLabel}`}
                </span>
              </div>
            )}

            <form onSubmit={handleVerify} noValidate>

              {/* OTP boxes */}
              <div className="mb-2">
                <p className="mb-3 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">
                  {t('auth.emailCode.code') || 'Entrez votre code'}
                </p>
                <OtpInput
                  length={codeLength}
                  value={code}
                  onChange={setCode}
                  hasError={!!error}
                />
                {/* progress bar */}
                <div className="otp-progress-track">
                  <div
                    className="otp-progress-fill"
                    style={{ width: `${(code.length / codeLength) * 100}%` }}
                  />
                </div>
              </div>

              {/* error */}
              {error && (
                <div className="error-shake mt-4 flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <circle cx="12" cy="12" r="10" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
                  </svg>
                  {error}
                </div>
              )}

              {/* success */}
              {success && (
                <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  <span className="relative flex h-3 w-3 shrink-0">
                    <span className="ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                  </span>
                  {success}
                </div>
              )}

              {/* submit */}
              <button
                type="submit"
                disabled={isAuthLoading || !isComplete}
                className="btn-primary mt-5"
              >
                {isAuthLoading ? (
                  <><span className="spinner" />{t('auth.emailCode.loading') || 'Vérification…'}</>
                ) : (
                  <>
                    {t('auth.emailCode.submit') || 'Vérifier'}
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </button>

              {/* secondary actions */}
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isAuthLoading || resending}
                  className="btn-secondary"
                >
                  {resending ? (
                    <><span className="spinner-dark" />{t('auth.emailCode.resend') || 'Renvoi…'}</>
                  ) : (
                    <>
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                      {t('auth.emailCode.resend') || 'Renvoyer'}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => logout('/admin/login')}
                  className="btn-secondary"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                  {t('auth.emailCode.signOut') || 'Déconnexion'}
                </button>
              </div>
            </form>
          </div>

          {/* instructions note */}
          <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-slate-200 bg-white/60 px-4 py-3.5 text-sm text-slate-500 backdrop-blur-sm">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
            {t('auth.emailCode.instructions') || 'Vérifiez votre boîte mail et copiez le code reçu. Pensez à consulter les spams si vous ne le voyez pas.'}
          </div>

          <p className="mt-4 text-center text-xs text-slate-400">
            Accès réservé aux administrateurs autorisés
          </p>
        </div>
      </main>
    </div>
  );
}

export default AdminVerifyEmailCodePage;