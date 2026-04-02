import { useLanguage } from '../context/LanguageContext';

function BrandLogo({ className = '' }) {
  const { isRTL, t } = useLanguage();

  return (
    <a
      href="/"
      className={`group inline-flex items-center gap-4 rounded-2xl px-1 py-1 transition-all duration-300 hover:scale-[1.02] ${isRTL ? 'flex-row-reverse' : ''} ${className}`}
      aria-label="VIAS"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200/90 bg-white shadow-md transition-all duration-300 group-hover:shadow-lg sm:h-16 sm:w-16 lg:h-20 lg:w-20">
        <img
          src="/logo.png"
          alt="VIAS Logo"
          className="h-full w-full rounded-full object-contain p-1"
        />
      </div>

      <div className={`${isRTL ? 'text-right' : 'text-left'} animate-[fadeInUp_0.45s_ease-out]`}>
        <div className="text-xl font-bold tracking-[0.18em] text-slate-900 sm:text-2xl">VIAS</div>
        <div className="text-sm font-medium text-slate-500 sm:text-base">{t('header.title')}</div>
      </div>
    </a>
  );
}

export default BrandLogo;
