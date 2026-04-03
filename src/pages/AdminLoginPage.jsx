import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import AuthLoadingScreen from '../components/auth/AuthLoadingScreen';
import FormField from '../components/FormField';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../context/LanguageContext';
import { isSupabaseConfigured } from '../lib/supabaseClient';

function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, isRTL } = useLanguage();
  const { login, isAdmin, isAuthLoading } = useAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused]   = useState(''); // 'email' | 'password' | ''

  if (isAuthLoading && !email && !password && !error) {
    return <AuthLoadingScreen title={t('auth.login.title')} description={t('auth.login.description')} />;
  }

  if (isAdmin) {
    return <Navigate to="/historique" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError(t('auth.login.validation'));
      return;
    }

    try {
      const result = await login({ email, password });
      navigate(location.state?.from?.pathname || '/historique', { replace: true });
    } catch (loginError) {
      if (loginError.message === 'admin-not-allowed') {
        setError(t('auth.login.notAllowed'));
        return;
      }
      if (loginError.message === 'Invalid login credentials') {
        setError(t('auth.login.invalidCredentials') || 'Identifiants invalides.');
        return;
      }
      if (loginError.message === 'admin-verification-service-unavailable') {
        setError(t('auth.emailCode.serviceUnavailable'));
        return;
      }
      setError(loginError.message || t('auth.login.error'));
    }
  };

  return (
    <div className={`login-root min-h-screen ${isRTL ? 'text-right' : 'text-left'}`}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=DM+Sans:wght@400;500&display=swap');

        .login-root {
          font-family: 'DM Sans', sans-serif;
          background: #f4f5f9;
        }
        .login-root .sora { font-family: 'Sora', sans-serif; }

        /* full-bleed background split */
        .login-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          background: linear-gradient(160deg, #0f172a 0%, #1e3a5f 45%, #f4f5f9 45%);
        }
        @media (max-width: 640px) {
          .login-bg {
            background: linear-gradient(170deg, #0f172a 0%, #1e3a5f 38%, #f4f5f9 38%);
          }
        }

        /* decorative blob */
        .blob {
          position: fixed;
          top: -60px;
          right: -60px;
          width: 260px;
          height: 260px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(96,165,250,0.18) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* card */
        .login-card {
          position: relative;
          z-index: 1;
          background: #fff;
          border-radius: 28px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.07), 0 20px 60px -10px rgba(15,23,42,0.18);
        }

        /* field focus ring */
        .field-custom {
          width: 100%;
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          padding: 13px 16px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: #0f172a;
          background: #f8fafc;
          outline: none;
          transition: border-color 0.18s, background 0.18s, box-shadow 0.18s;
          -webkit-appearance: none;
        }
        .field-custom::placeholder { color: #94a3b8; }
        .field-custom:focus {
          border-color: #0f172a;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(15,23,42,0.08);
        }
        .field-custom.has-error {
          border-color: #fca5a5;
          background: #fff5f5;
        }

        /* submit button */
        .btn-submit {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: #0f172a;
          color: #fff;
          border: none;
          border-radius: 14px;
          padding: 14px 24px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'Sora', sans-serif;
          cursor: pointer;
          transition: background 0.18s, transform 0.12s, box-shadow 0.18s;
          -webkit-tap-highlight-color: transparent;
        }
        .btn-submit:hover:not(:disabled) {
          background: #1e293b;
          box-shadow: 0 8px 24px -4px rgba(15,23,42,0.35);
        }
        .btn-submit:active:not(:disabled) { transform: scale(0.975); }
        .btn-submit:disabled {
          background: #94a3b8;
          cursor: not-allowed;
        }

        /* spinner */
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        /* show/hide password eye button */
        .eye-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          padding: 4px;
          -webkit-tap-highlight-color: transparent;
          transition: color 0.15s;
        }
        .eye-btn:hover { color: #475569; }

        /* label float label style */
        .field-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          margin-bottom: 6px;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }
        .field-label.focused { color: #0f172a; }

        /* error shake */
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-5px); }
          40%       { transform: translateX(5px); }
          60%       { transform: translateX(-4px); }
          80%       { transform: translateX(4px); }
        }
        .error-shake { animation: shake 0.35s ease; }
      `}</style>

      {/* background split */}
      <div className="login-bg" />
      <div className="blob" />

      <div className="relative z-10">
        <Header />
      </div>

      <main className="relative z-10 flex min-h-[calc(100vh-64px)] flex-col items-center justify-start px-4 pb-12 pt-8 sm:justify-center sm:pt-4">

        <div className="w-full max-w-sm sm:max-w-md">

          {/* top label above card */}
          <div className="mb-5 flex flex-col items-center gap-2 text-center">
            {/* icon */}
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-sm">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <span className="sora inline-flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-200">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              {t('auth.login.badge') || 'Espace Admin'}
            </span>
          </div>

          {/* card */}
          <div className="login-card px-6 py-8 sm:px-8">

            <div className="mb-6">
              <h1 className="sora text-2xl font-bold text-slate-900 sm:text-3xl">
                {t('auth.login.title') || 'Connexion'}
              </h1>
              <p className="mt-1.5 text-sm leading-6 text-slate-500">
                {t('auth.login.description') || 'Connectez-vous à votre espace administrateur.'}
              </p>
            </div>

            {/* supabase missing warning */}
            {!isSupabaseConfigured && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-700">
                <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <span>{t('auth.login.supabaseMissing')}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="space-y-4">

                {/* email field */}
                <div>
                  <label
                    htmlFor="admin-email"
                    className={`field-label ${focused === 'email' ? 'focused' : ''}`}
                  >
                    {t('auth.login.email') || 'Adresse e-mail'}
                  </label>
                  <div className="relative">
                    <input
                      id="admin-email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocused('email')}
                      onBlur={() => setFocused('')}
                      className={`field-custom ${isRTL ? 'text-right' : ''} ${error ? 'has-error' : ''}`}
                      placeholder={t('auth.login.emailPlaceholder') || 'admin@exemple.com'}
                      style={{ paddingLeft: isRTL ? '16px' : '44px' }}
                    />
                    {/* mail icon */}
                    <svg
                      className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400"
                      style={{ width: 18, height: 18, left: isRTL ? 'auto' : 14, right: isRTL ? 14 : 'auto' }}
                      fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                </div>

                {/* password field */}
                <div>
                  <label
                    htmlFor="admin-password"
                    className={`field-label ${focused === 'password' ? 'focused' : ''}`}
                  >
                    {t('auth.login.password') || 'Mot de passe'}
                  </label>
                  <div className="relative">
                    <input
                      id="admin-password"
                      type={showPass ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocused('password')}
                      onBlur={() => setFocused('')}
                      className={`field-custom ${isRTL ? 'text-right' : ''} ${error ? 'has-error' : ''}`}
                      placeholder={t('auth.login.passwordPlaceholder') || '••••••••'}
                      style={{ paddingLeft: isRTL ? '44px' : '44px', paddingRight: 44 }}
                    />
                    {/* lock icon */}
                    <svg
                      className="pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-400"
                      style={{ width: 18, height: 18, left: isRTL ? 'auto' : 14, right: isRTL ? 14 : 'auto' }}
                      fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    {/* show/hide eye */}
                    <button
                      type="button"
                      onClick={() => setShowPass((s) => !s)}
                      className="eye-btn"
                      aria-label={showPass ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showPass ? (
                        <svg className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* error message */}
                {error && (
                  <div className="error-shake flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <circle cx="12" cy="12" r="10" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
                    </svg>
                    {error}
                  </div>
                )}

                {/* submit */}
                <button
                  type="submit"
                  disabled={isAuthLoading || !isSupabaseConfigured}
                  className="btn-submit"
                  style={{ marginTop: 8 }}
                >
                  {isAuthLoading ? (
                    <>
                      <span className="spinner" />
                      {t('auth.login.loading') || 'Connexion…'}
                    </>
                  ) : (
                    <>
                      {t('auth.login.submit') || 'Se connecter'}
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* footer note */}
          <p className="mt-5 text-center text-xs text-slate-400">
            Accès réservé aux administrateurs autorisés
          </p>
        </div>
      </main>
    </div>
  );
}

export default AdminLoginPage;
