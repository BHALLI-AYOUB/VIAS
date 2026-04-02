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
    <div className={`min-h-screen bg-transparent text-slate-900 transition-all ${isRTL ? 'text-right' : 'text-left'}`}>
      <Header />

      <main>
        <section className="relative overflow-hidden border-b border-slate-200/70 bg-ink text-white">
          <div className="absolute inset-0 bg-grid bg-[size:48px_48px] opacity-10" />
          <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl" />
          <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-brand-500/10 blur-3xl" />
          <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-20">
            <div className="relative z-10">
              <span className="badge border-brand-300/40 bg-brand-400/10 text-brand-200">{t('home.heroBadge')}</span>
              <h1 className="mt-6 max-w-3xl text-5xl leading-none text-white md:text-6xl">{t('home.heroTitle')}</h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">{t('home.heroDescription')}</p>
              <div className={`mt-8 flex flex-wrap gap-4 ${isRTL ? 'justify-end' : ''}`}>
                <a
                  href="#declaration"
                  className={`inline-flex items-center gap-2 rounded-full bg-brand-400 px-6 py-3 text-sm font-semibold text-ink transition hover:bg-brand-300 ${
                    isRTL ? 'flex-row-reverse' : ''
                  }`}
                >
                  {t('home.startDeclaration')}
                  <ArrowDownRight className="h-4 w-4" />
                </a>
                <div className={`inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm text-slate-300 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Building2 className="h-4 w-4 text-brand-300" />
                  {t('home.statsLocations', { count: localisations.length })} • {t('home.statsMachines', { count: machines.length })}
                </div>
              </div>
            </div>

            <div className="relative z-10">
              <div className="panel border-white/10 bg-white/5 p-6 text-white shadow-none">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-3xl font-bold text-brand-300">{machineCategories.length}</div>
                    <div className="mt-2 text-sm text-slate-300">{t('home.officialCategories')}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-3xl font-bold text-brand-300">{localisations.length}</div>
                    <div className="mt-2 text-sm text-slate-300">{t('home.sitesAndLocations')}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-3xl font-bold text-brand-300">2</div>
                    <div className="mt-2 text-sm text-slate-300">{t('home.declarationModes')}</div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {messages.home.highlights.map((highlight, index) => {
                    const Icon = highlightIcons[index];
                    return (
                      <div key={highlight.title} className="rounded-2xl border border-white/10 bg-slate-950/20 p-4">
                        <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                          <div className="rounded-2xl bg-brand-400/15 p-2 text-brand-300">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <h2 className="text-lg text-white">{highlight.title}</h2>
                            <p className="mt-1 text-sm leading-6 text-slate-300">{highlight.text}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
          <DeclarationForm />
        </section>
      </main>
    </div>
  );
}

export default HomePage;
