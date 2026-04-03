import { useLanguage } from '../context/LanguageContext';

function BrandLogo({ className = '' }) {
  const { isRTL, t } = useLanguage();

  return (
    <a
      href="/"
      className={`group inline-flex min-w-0 items-center gap-3 rounded-2xl px-1 py-1 transition-all duration-300 hover:scale-[1.02] ${isRTL ? 'flex-row-reverse' : ''} ${className}`}
      aria-label="VIAS"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.4rem] border border-slate-200/90 bg-white shadow-md transition-all duration-300 group-hover:shadow-lg sm:h-14 sm:w-14 lg:h-16 lg:w-16">
        <img
          src="/logo.png"
          alt="VIAS Logo"
          className="h-full w-full rounded-[1.4rem] object-contain p-1"
        />
      </div>

      <div className={`min-w-0 ${isRTL ? 'text-right' : 'text-left'} animate-[fadeInUp_0.45s_ease-out]`}>
        <div className="truncate text-lg font-bold tracking-[0.18em] text-slate-900 sm:text-xl lg:text-2xl">VIAS</div>
        <div className="max-w-[9rem] text-sm font-medium leading-5 text-slate-500 sm:max-w-none sm:text-base">{t('header.title')}</div>
      </div>
    </a>
  );
}

export default BrandLogo;
