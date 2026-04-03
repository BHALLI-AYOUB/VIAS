import { useEffect, useMemo, useRef, useState } from 'react';
import Header from '../components/Header';
import HistoryFilters from '../components/history/HistoryFilters';
import HistoryTimeline from '../components/history/HistoryTimeline';
import LatestMovementsWidget from '../components/history/LatestMovementsWidget';
import MachineHistoryCard from '../components/history/MachineHistoryCard';
import { useLanguage } from '../context/LanguageContext';
import { localisations } from '../data/localisations';
import { machineCategories } from '../data/machineCategories';
import { fetchFilteredMovements, fetchLatestMovements } from '../services/historyService';
import { getHistoryFilterOptions, searchMachines } from '../services/machineService';
import { buildTrajectorySummary, getLatestMovement } from '../utils/historyHelpers';

const initialFilters = {
  search: '',
  categorie: '',
  localisationActuelle: '',
  localisationDepart: '',
  localisationArrivee: '',
  typeMouvement: '',
  dateStart: '',
  dateEnd: '',
};

const movementTypes = [
  'entree', 'sortie', 'transfert', 'chantier',
  'atelier', 'panne', 'maintenance', 'retour',
];

/* ─── helpers ───────────────────────────────────────────────── */
function ActiveFilterCount({ filters }) {
  const count = Object.values(filters).filter(Boolean).length;
  if (!count) return null;
  return (
    <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-white">
      {count}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-4">
      <div className="skeleton-shimmer absolute inset-0" />
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-slate-100" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-1/3 rounded bg-slate-100" />
          <div className="h-2.5 w-1/2 rounded bg-slate-100" />
        </div>
        <div className="h-6 w-16 rounded-full bg-slate-100" />
      </div>
    </div>
  );
}

/* ─── main page ─────────────────────────────────────────────── */
function HistoriquePage() {
  const { isRTL, t } = useLanguage();
  const [filters, setFilters]                 = useState(initialFilters);
  const [machines, setMachines]               = useState([]);
  const [movements, setMovements]             = useState([]);
  const [latestMovements, setLatestMovements] = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState('');
  const [filtersOpen, setFiltersOpen]         = useState(false);
  const [activeTab, setActiveTab]             = useState('machines');

  // FIX: separate refs for toggle button and drawer panel
  const toggleBtnRef = useRef(null);
  const drawerRef    = useRef(null);

  const options = useMemo(
    () => ({
      ...getHistoryFilterOptions(),
      categories: machineCategories.map((c) => c.label),
      locations: localisations,
      movementTypes,
    }),
    [],
  );

  /* data fetch */
  useEffect(() => {
    let active = true;
    async function loadHistory() {
      setLoading(true);
      setError('');
      try {
        const [machineResults, movementResults, latestResults] = await Promise.all([
          searchMachines(filters),
          fetchFilteredMovements(filters),
          fetchLatestMovements(),
        ]);
        if (!active) return;
        setMachines(machineResults);
        setMovements(movementResults);
        setLatestMovements(latestResults);
      } catch (loadError) {
        if (!active) return;
        setError(loadError.message || t('history.loadError'));
      } finally {
        if (active) setLoading(false);
      }
    }
    loadHistory();
    return () => { active = false; };
  }, [filters, t]);

  const movementsByParc = useMemo(
    () =>
      movements.reduce((acc, m) => {
        acc[m.numero_parc] = acc[m.numero_parc] || [];
        acc[m.numero_parc].push(m);
        return acc;
      }, {}),
    [movements],
  );

  /* FIX: outside-click uses pointerdown and skips the toggle button ref */
  useEffect(() => {
    if (!filtersOpen) return;
    function onPointerDown(e) {
      if (toggleBtnRef.current?.contains(e.target)) return; // button handles its own toggle
      if (drawerRef.current?.contains(e.target)) return;    // click inside drawer → keep open
      setFiltersOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [filtersOpen]);

  const hasActiveFilters = Object.values(filters).some(Boolean);
  const handleFilterChange = (field, value) =>
    setFilters((cur) => ({ ...cur, [field]: value }));
  const handleReset = () => {
    setFilters(initialFilters);
    setFiltersOpen(false);
  };

  return (
    <div className={`historique-root min-h-screen bg-[#f4f5f9] ${isRTL ? 'text-right' : 'text-left'}`}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=DM+Sans:wght@400;500&display=swap');

        .historique-root            { font-family: 'DM Sans', sans-serif; color: #0f172a; }
        .historique-root .sora      { font-family: 'Sora', sans-serif; }

        .hero-bg {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 55%, #0f172a 100%);
        }

        /*
         * FIX — ghost-space bug:
         * Use CSS grid row animation instead of opacity/pointer-events.
         * grid-template-rows: 0fr  → height = 0, no space taken
         * grid-template-rows: 1fr  → height = natural content height
         * The inner div must have overflow:hidden + min-height:0
         */
        .drawer-wrap {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.28s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .drawer-wrap.is-open {
          grid-template-rows: 1fr;
          margin-top: 8px;
        }
        .drawer-inner {
          overflow: hidden;
          min-height: 0;
        }

        /* shimmer skeleton */
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .skeleton-shimmer {
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.65) 50%, transparent 100%);
          animation: shimmer 1.5s infinite;
        }

        .tab-btn { transition: background 0.18s ease, color 0.18s ease; }
        .tab-btn.active { background: #0f172a; color: #fff; }

        .card-press { transition: transform 0.12s ease; }
        .card-press:active { transform: scale(0.983); }

        .bottom-safe { padding-bottom: max(8px, env(safe-area-inset-bottom)); }
      `}</style>

      <Header />

      <main className="mx-auto max-w-2xl px-4 pb-28 pt-4 sm:px-6 lg:max-w-7xl lg:px-8">

        {/* HERO */}
        <section className="hero-bg relative overflow-hidden rounded-3xl px-5 py-8 text-white shadow-xl sm:px-8 sm:py-10">
          <div
            className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full opacity-[0.12]"
            style={{ background: 'radial-gradient(circle, #60a5fa, transparent 70%)' }}
          />
          <span className="sora inline-flex items-center gap-1.5 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-200">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
            {t('history.badge') || 'Historique'}
          </span>
          <h1 className="sora mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl">
            {t('history.pageTitle') || 'Historique des machines'}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300/90">
            {t('history.pageDescription') || 'Suivez les mouvements et l\'historique de vos machines.'}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              { label: 'Machines',   value: loading ? '—' : machines.length },
              { label: 'Mouvements', value: loading ? '—' : movements.length },
              { label: 'Récents',    value: loading ? '—' : latestMovements.length },
            ].map(({ label, value }) => (
              <div key={label} className="flex min-w-[80px] flex-col rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                <span className="sora text-xl font-bold text-white">{value}</span>
                <span className="mt-0.5 text-[11px] text-slate-400">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* FILTER BAR */}
        <div className="mt-5 flex items-center gap-2">

          {/* toggle — ref on this button so outside-click ignores it */}
          <button
            ref={toggleBtnRef}
            onClick={() => setFiltersOpen((o) => !o)}
            className="flex shrink-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:shadow-md active:scale-[0.97]"
          >
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 12h10M10 20h4" />
            </svg>
            <span className="whitespace-nowrap">Filtres</span>
            <ActiveFilterCount filters={filters} />
            <svg
              className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${filtersOpen ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* inline search */}
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="search"
              placeholder={t('history.searchPlaceholder') || 'Numéro de parc, catégorie…'}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-9 pr-4 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800/20 shadow-sm"
            />
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-500 transition hover:bg-rose-100 active:scale-95"
              aria-label="Réinitialiser"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/*
          DRAWER — grid-rows trick:
          - Closed: grid-template-rows:0fr + inner overflow:hidden → zero height, zero space
          - Open:   grid-template-rows:1fr → content height, smooth animation
        */}
        <div className={`drawer-wrap ${filtersOpen ? 'is-open' : ''}`}>
          <div className="drawer-inner">
            <div ref={drawerRef} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-lg">
              <HistoryFilters
                filters={filters}
                options={options}
                onChange={handleFilterChange}
                onReset={handleReset}
              />
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
            </svg>
            {error}
          </div>
        )}

        {/* MOBILE TABS */}
        <div className="mt-5 flex gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm lg:hidden">
          {[
            { id: 'machines', label: 'Machines' },
            { id: 'timeline', label: 'Timeline' },
            { id: 'latest',   label: 'Récents'  },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`tab-btn flex-1 rounded-xl px-3 py-2.5 text-xs font-semibold ${
                activeTab === id ? 'active' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="mt-5 lg:grid lg:gap-6 lg:grid-cols-[minmax(0,1.35fr)_360px]">

          {/* machines list */}
          <div className={activeTab !== 'machines' ? 'hidden lg:block' : undefined}>
            <div className="space-y-5">
              <div className="flex items-baseline justify-between">
                <div>
                  <h2 className="sora text-xl font-semibold text-slate-900">
                    {t('history.machineResults') || 'Résultats machines'}
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {t('history.machineResultsDescription') || ''}
                  </p>
                </div>
                {!loading && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                    {machines.length}
                  </span>
                )}
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((n) => <SkeletonCard key={n} />)}
                </div>
              ) : machines.length ? (
                <div className="space-y-3">
                  {machines.map((machine) => {
                    const machineMovements = movementsByParc[machine.numero_parc] || [];
                    return (
                      <div key={machine.id} className="card-press">
                        <MachineHistoryCard
                          machine={machine}
                          latestMovement={getLatestMovement(machineMovements)}
                          trajectory={buildTrajectorySummary(machineMovements, machine.localisation_actuelle)}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-slate-200 bg-white py-12 text-center">
                  <span className="text-3xl">📭</span>
                  <p className="text-sm text-slate-400">{t('history.noResults') || 'Aucun résultat'}</p>
                </div>
              )}
            </div>
          </div>

          {/* timeline — mobile tab */}
          <div className={`lg:hidden ${activeTab !== 'timeline' ? 'hidden' : ''}`}>
            <HistoryTimeline movements={movements} />
          </div>
          {/* timeline — always desktop */}
          <div className="mt-5 hidden lg:block">
            <HistoryTimeline movements={movements} />
          </div>

          {/* latest movements */}
          <div className={`lg:row-span-2 ${activeTab !== 'latest' ? 'hidden lg:block' : ''}`}>
            <LatestMovementsWidget movements={latestMovements} loading={loading} />
          </div>
        </div>
      </main>

      {/* BOTTOM NAV */}
      <nav className="bottom-safe fixed bottom-0 left-0 right-0 z-50 flex border-t border-slate-100 bg-white/90 px-4 pt-2 backdrop-blur-md lg:hidden">
        {[
          {
            id: 'machines', label: 'Machines',
            icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><rect x="2" y="7" width="20" height="14" rx="2" /><path strokeLinecap="round" d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" /></svg>,
          },
          {
            id: 'timeline', label: 'Timeline',
            icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
          },
          {
            id: 'latest', label: 'Récents',
            icon: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
          },
        ].map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-1 flex-col items-center gap-1 pb-2 pt-1 text-[10px] font-semibold transition-colors ${
              activeTab === id ? 'text-slate-900' : 'text-slate-400'
            }`}
          >
            <span className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${activeTab === id ? 'bg-slate-900 text-white' : ''}`}>
              {icon}
            </span>
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default HistoriquePage;