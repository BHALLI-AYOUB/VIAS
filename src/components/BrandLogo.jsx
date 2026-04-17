import { useLanguage } from '../context/LanguageContext';

function BrandLogo({ className = '' }) {
  const { isRTL, t } = useLanguage();

  return (
    <a
      href="/"
      className={`group inline-flex shrink-0 items-center gap-3 rounded-2xl px-1 py-1 transition-all duration-300 hover:scale-[1.01] ${isRTL ? 'flex-row-reverse' : ''} ${className}`}
      aria-label="VIAS"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.2rem] border border-white/10 bg-[#14151b] shadow-[0_16px_34px_rgba(0,0,0,0.28)] transition-all duration-300 group-hover:border-brand-300/35 group-hover:shadow-[0_20px_44px_rgba(0,0,0,0.34)] sm:h-14 sm:w-14">
        <img
          src="/logo.png"
          alt="VIAS Logo"
          className="h-full w-full rounded-[1.2rem] object-contain p-1"
        />
      </div>

      <div className={`min-w-[7.5rem] ${isRTL ? 'text-right' : 'text-left'} animate-[fadeInUp_0.45s_ease-out]`}>
        <div className="whitespace-nowrap text-lg font-bold tracking-[0.18em] text-white sm:text-xl">VIAS</div>
        <div className="max-w-[11rem] truncate text-sm font-medium leading-5 text-slate-400 sm:text-base">{t('header.title')}</div>
      </div>
    </a>
  );
}

export default BrandLogo;
