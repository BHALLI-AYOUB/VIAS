import { Building2, Languages } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { useLanguage } from '../context/LanguageContext';

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

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <BrandLogo />

        <div className={`flex items-center gap-3 text-sm text-slate-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="hidden items-center gap-4 md:flex">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2">
              <Building2 className="h-4 w-4 text-brand-600" />
              {t('header.readiness')}
            </div>
            <a href="#declaration" className="rounded-full bg-ink px-4 py-2 font-medium text-white transition hover:bg-slate-800">
              {t('header.newDeclaration')}
            </a>
          </div>

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
