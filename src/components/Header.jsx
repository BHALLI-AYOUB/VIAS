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
      className={`inline-flex min-h-[42px] items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
        active
          ? 'border-brand-300 bg-brand-400 text-ink shadow-[0_12px_28px_rgba(245,196,0,0.22)]'
          : 'border-white/10 bg-[linear-gradient(180deg,rgba(27,30,41,0.92),rgba(17,19,27,0.94))] text-slate-200 hover:border-white/20 hover:bg-[#1b1d24]'
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
  const { isAdmin, logout, adminEmail } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const canAccessAdmin = isAdmin;

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const desktopNavLinkClass = ({ isActive }) =>
    `rounded-full px-3 py-2.5 font-medium transition xl:px-4 ${
      isActive
        ? 'bg-brand-400 text-ink shadow-[0_10px_24px_rgba(245,196,0,0.2)]'
        : 'text-slate-200 hover:bg-white/6'
    }`;

  const mobileLinkClass =
    'inline-flex min-h-[50px] w-full items-center justify-between rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(27,30,41,0.92),rgba(17,19,27,0.94))] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-[#1d1f28]';

  const closeMenu = () => setMobileMenuOpen(false);

  const handleLogout = () => {
    closeMenu();
    logout('/');
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[linear-gradient(180deg,rgba(11,13,20,0.88),rgba(8,10,16,0.82))] shadow-[0_18px_48px_rgba(0,0,0,0.24)] backdrop-blur-xl supports-[backdrop-filter]:bg-[linear-gradient(180deg,rgba(11,13,20,0.82),rgba(8,10,16,0.74))]">
        <div className="page-shell">
          <div className={`flex items-center justify-between gap-3 py-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <BrandLogo className="hidden lg:inline-flex" />

            <button
              type="button"
              onClick={() => setMobileMenuOpen((current) => !current)}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#16171d] text-brand-300 shadow-[0_14px_32px_rgba(0,0,0,0.28)] transition hover:border-brand-300/35 hover:bg-[#1b1d24] lg:hidden"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <BrandLogo className="min-w-0 flex-1 lg:hidden" />

            <div className={`hidden min-w-0 flex-1 flex-wrap items-center justify-end gap-2 text-sm text-slate-300 lg:flex ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="hidden items-center gap-2 rounded-full border border-white/8 bg-[linear-gradient(180deg,rgba(27,30,41,0.92),rgba(17,19,27,0.94))] px-4 py-2 text-slate-300 2xl:inline-flex">
                <Building2 className="h-4 w-4 text-brand-300" />
                {t('header.readiness')}
              </div>

              <nav className={`flex min-w-0 flex-wrap items-center justify-end gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <NavLink to="/" className={desktopNavLinkClass} end>
                  {t('header.home')}
                </NavLink>
                {canAccessAdmin ? (
                  <NavLink to="/historique" className={desktopNavLinkClass}>
                    {t('header.history')}
                  </NavLink>
                ) : null}
                <a
                  href="/#declaration"
                  className="rounded-full border border-brand-300 bg-brand-400 px-3 py-2.5 font-medium text-ink transition hover:bg-brand-300 xl:px-4"
                >
                  {t('header.newDeclaration')}
                </a>
                {canAccessAdmin ? (
                  <button
                    type="button"
                    onClick={() => logout('/')}
                    className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-[linear-gradient(180deg,rgba(27,30,41,0.92),rgba(17,19,27,0.94))] px-3 py-2.5 font-medium text-slate-200 transition hover:border-white/20 hover:bg-[#1c1d25] xl:px-4 ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <LogOut className="h-4 w-4" />
                    {t('header.logout')}
                  </button>
                ) : (
                  <NavLink
                    to="/admin/login"
                    className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-[linear-gradient(180deg,rgba(27,30,41,0.92),rgba(17,19,27,0.94))] px-3 py-2.5 font-medium text-slate-100 transition hover:border-brand-300/35 hover:bg-[#1c1d25] xl:px-4 ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    <LogIn className="h-4 w-4 text-brand-300" />
                    {t('header.adminLogin')}
                  </NavLink>
                )}
              </nav>

              {canAccessAdmin ? (
                <div className={`hidden max-w-[18rem] items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-xs text-emerald-200 xl:inline-flex ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span className="truncate">{adminEmail || t('header.adminArea')}</span>
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
          className={`absolute inset-0 bg-slate-950/70 transition-opacity ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={closeMenu}
        />

        <div className={`absolute inset-x-0 top-0 max-h-[100vh] overflow-y-auto border-b border-white/10 bg-[#0d0e12] shadow-2xl transition-transform duration-300 ${mobileMenuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
          <div className="page-shell pb-8 pt-4">
            <div className={`mb-4 flex items-center justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <BrandLogo className="min-w-0 flex-1" />
              <button
                type="button"
                onClick={closeMenu}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(27,30,41,0.92),rgba(17,19,27,0.94))] text-slate-200"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="rounded-3xl border border-white/8 bg-[#15161d] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
                <div className={`mb-3 inline-flex items-center gap-2 rounded-full border border-brand-300/30 bg-brand-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand-200 ${isRTL ? 'flex-row-reverse' : ''}`}>
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
                      <LogIn className="h-4 w-4 text-brand-300" />
                    </NavLink>
                  )}
                </nav>
              </div>

              <div className="rounded-3xl border border-white/8 bg-[#15161d] p-4 shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
                <div className={`mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
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
                <div className={`inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-2 text-xs text-emerald-200 ${isRTL ? 'flex-row-reverse' : ''}`}>
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
