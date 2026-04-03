import { useEffect, useState } from 'react';
import { Building2, Globe2, Languages, LogIn, LogOut, Menu, ShieldCheck, X } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../hooks/useAuth';

function LanguageButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-[46px] items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const canAccessAdmin = isAdmin && isEmailVerifiedAdmin;

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const desktopNavLinkClass = ({ isActive }) =>
    `rounded-full px-4 py-2.5 font-medium transition ${
      isActive ? 'bg-brand-50 text-brand-900' : 'text-slate-700 hover:bg-slate-100'
    }`;

  const mobileLinkClass =
    'inline-flex min-h-[50px] w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50';

  const closeMenu = () => setMobileMenuOpen(false);

  const handleLogout = () => {
    closeMenu();
    logout('/');
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="page-shell">
          <div className={`flex items-center justify-between gap-3 py-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <BrandLogo className="min-w-0 flex-1" />

            <button
              type="button"
              onClick={() => setMobileMenuOpen((current) => !current)}
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div className={`hidden items-center gap-3 text-sm text-slate-600 lg:flex ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-4 py-2 xl:inline-flex">
                  <Building2 className="h-4 w-4 text-brand-600" />
                  {t('header.readiness')}
                </div>

                <nav className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <NavLink to="/" className={desktopNavLinkClass} end>
                    {t('header.home')}
                  </NavLink>
                  {canAccessAdmin ? (
                    <NavLink to="/historique" className={desktopNavLinkClass}>
                      {t('header.history')}
                    </NavLink>
                  ) : null}
                  <a href="/#declaration" className="rounded-full bg-ink px-4 py-2.5 font-medium text-white transition hover:bg-slate-800">
                    {t('header.newDeclaration')}
                  </a>
                  {canAccessAdmin ? (
                    <button
                      type="button"
                      onClick={() => logout('/')}
                      className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50 ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      <LogOut className="h-4 w-4" />
                      {t('header.logout')}
                    </button>
                  ) : (
                    <NavLink
                      to="/admin/login"
                      className={`inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-2.5 font-medium text-brand-900 transition hover:bg-brand-100 ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      <LogIn className="h-4 w-4" />
                      {t('header.adminLogin')}
                    </NavLink>
                  )}
                </nav>
              </div>

              {canAccessAdmin ? (
                <div className={`hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-800 2xl:inline-flex ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <ShieldCheck className="h-4 w-4" />
                  <span>{adminEmail || t('header.adminArea')}</span>
                </div>
              ) : null}

              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`} aria-label={t('header.switcherAria')}>
                <LanguageButton label={t('language.fr')} active={language === 'fr'} onClick={() => setLanguage('fr')} />
                <LanguageButton label={t('language.ar')} active={language === 'ar'} onClick={() => setLanguage('ar')} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className={`fixed inset-0 z-50 transition lg:hidden ${mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-slate-950/35 transition-opacity ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={closeMenu}
        />

        <div className={`absolute inset-x-0 top-0 max-h-[100vh] overflow-y-auto bg-[#fff9e6] shadow-2xl transition-transform duration-300 ${mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
          <div className="page-shell pb-8 pt-4">
            <div className={`mb-4 flex items-center justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <BrandLogo className="min-w-0 flex-1" />
              <button
                type="button"
                onClick={closeMenu}
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="rounded-3xl border border-brand-200/80 bg-white/70 p-4 shadow-sm">
                <div className={`mb-3 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-900 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Globe2 className="h-3.5 w-3.5" />
                  {t('header.readiness')}
                </div>

                <nav className="space-y-2">
                  <NavLink to="/" end className={mobileLinkClass} onClick={closeMenu}>
                    <span>{t('header.home')}</span>
                  </NavLink>
                  <Link to="/#declaration" className={mobileLinkClass} onClick={closeMenu}>
                    <span>{t('header.newDeclaration')}</span>
                  </Link>
                  {canAccessAdmin ? (
                    <NavLink to="/historique" className={mobileLinkClass} onClick={closeMenu}>
                      <span>{t('header.history')}</span>
                    </NavLink>
                  ) : null}

                  {canAccessAdmin ? (
                    <button type="button" onClick={handleLogout} className={mobileLinkClass}>
                      <span>{t('header.logout')}</span>
                      <LogOut className="h-4 w-4" />
                    </button>
                  ) : (
                    <NavLink to="/admin/login" className={mobileLinkClass} onClick={closeMenu}>
                      <span>{t('header.adminLogin')}</span>
                      <LogIn className="h-4 w-4" />
                    </NavLink>
                  )}
                </nav>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                <div className={`mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Languages className="h-4 w-4" />
                  {t('header.switcherAria')}
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <LanguageButton
                    label={t('language.fr')}
                    active={language === 'fr'}
                    onClick={() => {
                      setLanguage('fr');
                      closeMenu();
                    }}
                  />
                  <LanguageButton
                    label={t('language.ar')}
                    active={language === 'ar'}
                    onClick={() => {
                      setLanguage('ar');
                      closeMenu();
                    }}
                  />
                </div>
              </div>

              {canAccessAdmin ? (
                <div className={`inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-800 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <ShieldCheck className="h-4 w-4" />
                  <span className="truncate">{adminEmail || t('header.adminArea')}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Header;
