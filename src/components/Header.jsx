import { Building2, Languages, LogIn, LogOut, ShieldCheck } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../hooks/useAuth';

function LanguageButton({ code, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
        active
          ? 'border-brand-400 bg-brand-50 text-brand-900 shadow-sm'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
      }`}
      aria-pressed={active}
    >
      <Languages className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
}

function Header() {
  const { language, setLanguage, isRTL, t } = useLanguage();
  const { isAdmin, isEmailVerifiedAdmin, logout, adminEmail } = useAuth();
  const canAccessAdmin = isAdmin && isEmailVerifiedAdmin;
  const navLinkClass = ({ isActive }) =>
    `rounded-full px-4 py-2 font-medium transition ${
      isActive ? 'bg-brand-50 text-brand-900' : 'text-slate-700 hover:bg-slate-100'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <BrandLogo />

        <div className={`flex items-center gap-3 text-sm text-slate-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-4 py-2 lg:inline-flex">
              <Building2 className="h-4 w-4 text-brand-600" />
              {t('header.readiness')}
            </div>
            <nav className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <NavLink to="/" className={navLinkClass} end>
                {t('header.home')}
              </NavLink>
              {canAccessAdmin ? (
                <NavLink to="/historique" className={navLinkClass}>
                  {t('header.history')}
                </NavLink>
              ) : null}
              <a href="/#declaration" className="rounded-full bg-ink px-4 py-2 font-medium text-white transition hover:bg-slate-800">
                {t('header.newDeclaration')}
              </a>
              {canAccessAdmin ? (
                <button
                  type="button"
                  onClick={() => logout('/')}
                  className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50 ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <LogOut className="h-4 w-4" />
                  {t('header.logout')}
                </button>
              ) : (
                <NavLink
                  to="/admin/login"
                  className={`inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-2 font-medium text-brand-900 transition hover:bg-brand-100 ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <LogIn className="h-4 w-4" />
                  {t('header.adminLogin')}
                </NavLink>
              )}
            </nav>
          </div>

          {canAccessAdmin ? (
            <div className={`hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-800 xl:inline-flex ${isRTL ? 'flex-row-reverse' : ''}`}>
              <ShieldCheck className="h-4 w-4" />
              <span>{adminEmail || t('header.adminArea')}</span>
            </div>
          ) : null}

          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`} aria-label={t('header.switcherAria')}>
            <LanguageButton
              code="fr"
              label={t('language.fr')}
              active={language === 'fr'}
              onClick={() => setLanguage('fr')}
            />
            <LanguageButton
              code="ar"
              label={t('language.ar')}
              active={language === 'ar'}
              onClick={() => setLanguage('ar')}
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
