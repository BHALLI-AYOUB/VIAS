import { useEffect, useMemo, useState } from 'react';
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

const movementTypes = ['entree', 'sortie', 'transfert', 'chantier', 'atelier', 'panne', 'maintenance', 'retour'];

function HistoriquePage() {
  const { isRTL, t } = useLanguage();
  const [filters, setFilters] = useState(initialFilters);
  const [machines, setMachines] = useState([]);
  const [movements, setMovements] = useState([]);
  const [latestMovements, setLatestMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const options = useMemo(
    () => ({
      ...getHistoryFilterOptions(),
      categories: machineCategories.map((category) => category.label),
      locations: localisations,
      movementTypes,
    }),
    [],
  );

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

        if (!active) {
          return;
        }

        setMachines(machineResults);
        setMovements(movementResults);
        setLatestMovements(latestResults);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(loadError.message || t('history.loadError'));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadHistory();

    return () => {
      active = false;
    };
  }, [filters, t]);

  const movementsByParc = useMemo(
    () =>
      movements.reduce((accumulator, movement) => {
        accumulator[movement.numero_parc] = accumulator[movement.numero_parc] || [];
        accumulator[movement.numero_parc].push(movement);
        return accumulator;
      }, {}),
    [movements],
  );

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 ${isRTL ? 'text-right' : 'text-left'}`}>
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <section className="rounded-[2rem] bg-ink px-6 py-10 text-white shadow-panel">
          <div className="badge border-brand-300/40 bg-brand-400/10 text-brand-200">{t('history.badge')}</div>
          <h1 className="mt-4 text-4xl text-white md:text-5xl">{t('history.pageTitle')}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">{t('history.pageDescription')}</p>
        </section>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_380px]">
          <div className="space-y-6">
            <HistoryFilters
              filters={filters}
              options={options}
              onChange={(field, value) => setFilters((current) => ({ ...current, [field]: value }))}
              onReset={() => setFilters(initialFilters)}
            />

            {error ? (
              <div className="rounded-3xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">{error}</div>
            ) : null}

            <section className="space-y-4">
              <div>
                <h2 className="text-2xl text-slate-950">{t('history.machineResults')}</h2>
                <p className="mt-1 text-sm text-slate-500">{t('history.machineResultsDescription')}</p>
              </div>

              {loading ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">{t('history.loading')}</div>
              ) : machines.length ? (
                <div className="grid gap-4">
                  {machines.map((machine) => {
                    const machineMovements = movementsByParc[machine.numero_parc] || [];
                    return (
                      <MachineHistoryCard
                        key={machine.id}
                        machine={machine}
                        latestMovement={getLatestMovement(machineMovements)}
                        trajectory={buildTrajectorySummary(machineMovements, machine.localisation_actuelle)}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                  {t('history.noResults')}
                </div>
              )}
            </section>

            <HistoryTimeline movements={movements} />
          </div>

          <div className="space-y-6">
            <LatestMovementsWidget movements={latestMovements} loading={loading} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default HistoriquePage;
