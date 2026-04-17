import { ArrowDownRight, Building2, MapPinned, Send, Truck } from 'lucide-react';
import Header from '../components/Header';
import DeclarationForm from '../components/DeclarationForm';
import { machineCategories } from '../data/machineCategories';
import { localisations } from '../data/localisations';
import { machines } from '../data/machines';
import { useLanguage } from '../context/LanguageContext';

const highlightIcons = [Truck, MapPinned, Send];

function HomePage() {
  const { messages, t, isRTL } = useLanguage();

  return (
    <div className={`site-atmosphere min-h-screen overflow-x-hidden text-slate-100 transition-all ${isRTL ? 'text-right' : 'text-left'}`}>
      <Header />

      <main className="relative">
        <section className="relative overflow-hidden border-b border-white/6 bg-transparent text-white">
          <div className="absolute inset-0 bg-grid bg-[size:46px_46px] opacity-[0.04]" />
          <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_top,rgba(245,196,0,0.1),transparent_22%),radial-gradient(circle_at_18%_12%,rgba(255,255,255,0.05),transparent_22%),radial-gradient(circle_at_82%_16%,rgba(80,110,255,0.11),transparent_24%)]" />
          <div className="absolute left-[-140px] top-[-60px] h-80 w-80 rounded-full bg-brand-400/14 blur-3xl" />
          <div className="absolute right-[-120px] top-20 h-96 w-96 rounded-full bg-[#2f4f88]/22 blur-3xl" />
          <div className="absolute bottom-[-120px] left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-white/[0.04] blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[#07090f]/70" />

          <div className="relative mx-auto w-full max-w-[1080px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-16">
            <div className={`mx-auto max-w-[760px] ${isRTL ? 'text-right' : 'text-left'} lg:text-center`}>
              <div className={`flex ${isRTL ? 'justify-start lg:justify-center' : 'justify-start lg:justify-center'}`}>
                <span className="inline-flex items-center gap-2 rounded-full border border-brand-300/25 bg-[linear-gradient(180deg,rgba(29,31,42,0.9),rgba(18,20,28,0.9))] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-200 shadow-[0_12px_30px_rgba(0,0,0,0.22)]">
                  {t('home.heroBadge')}
                </span>
              </div>

              <h1 className="hero-title mt-5 text-[2.55rem] leading-[0.98] text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.32)] sm:text-5xl lg:text-6xl">
                {t('home.heroTitle')}
              </h1>
              <p className="hero-copy mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base lg:text-lg">
                {t('home.heroDescription')}
              </p>

              <div className={`mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap ${isRTL ? 'sm:justify-end lg:justify-center' : 'sm:justify-start lg:justify-center'}`}>
                <a
                  href="#declaration"
                  className={`inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full border border-brand-300 bg-brand-400 px-6 py-3 text-sm font-semibold text-ink transition hover:bg-brand-300 ${
                    isRTL ? 'flex-row-reverse' : ''
                  }`}
                >
                  {t('home.startDeclaration')}
                  <ArrowDownRight className="h-4 w-4" />
                </a>
                <div className={`inline-flex min-h-[50px] items-center justify-center gap-3 rounded-full border border-white/10 bg-[linear-gradient(180deg,rgba(25,27,37,0.92),rgba(14,16,24,0.92))] px-5 py-3 text-sm text-slate-300 shadow-[0_16px_38px_rgba(0,0,0,0.22)] ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Building2 className="h-4 w-4 text-brand-300" />
                  <span className="text-center">{t('home.statsLocations', { count: localisations.length })} | {t('home.statsMachines', { count: machines.length })}</span>
                </div>
              </div>
            </div>

            <div className="site-panel mx-auto mt-8 max-w-[980px] rounded-[1.9rem] p-4 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="site-subpanel rounded-[1.35rem] p-4">
                  <div className="text-2xl font-bold text-brand-300 sm:text-3xl">{machineCategories.length}</div>
                  <div className="mt-2 text-sm text-slate-300">{t('home.officialCategories')}</div>
                </div>
                <div className="site-subpanel rounded-[1.35rem] p-4">
                  <div className="text-2xl font-bold text-brand-300 sm:text-3xl">{localisations.length}</div>
                  <div className="mt-2 text-sm text-slate-300">{t('home.sitesAndLocations')}</div>
                </div>
                <div className="site-subpanel rounded-[1.35rem] p-4">
                  <div className="text-2xl font-bold text-brand-300 sm:text-3xl">1</div>
                  <div className="mt-2 text-sm text-slate-300">{t('home.historyModule')}</div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {messages.home.highlights.map((highlight, index) => {
                  const Icon = highlightIcons[index];

                  return (
                    <div key={highlight.title} className="site-subpanel rounded-[1.35rem] p-4">
                      <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                        <div className="rounded-2xl bg-brand-400/14 p-2 text-brand-300">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="text-base font-semibold text-white sm:text-lg">{highlight.title}</h2>
                          <p className="mt-1 text-sm leading-6 text-slate-400">{highlight.text}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="relative mx-auto w-full max-w-[1080px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
          <div className="pointer-events-none absolute left-0 top-10 h-56 w-56 rounded-full bg-brand-400/6 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-[#274777]/12 blur-3xl" />
          <DeclarationForm />
        </section>
      </main>
    </div>
  );
}

export default HomePage;
