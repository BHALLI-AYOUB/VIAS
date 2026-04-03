import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import HistoryTimeline from '../components/history/HistoryTimeline';
import TrajectorySummary from '../components/history/TrajectorySummary';
import { useLanguage } from '../context/LanguageContext';
import { getMachineHistoryBundle } from '../services/historyService';
import { getMachineById } from '../services/machineService';

function MachineDetailsPage() {
  const { id } = useParams();
  const { isRTL, t, getCategoryLabel } = useLanguage();
  const [machine, setMachine] = useState(null);
  const [movements, setMovements] = useState([]);
  const [trajectory, setTrajectory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadMachine() {
      setLoading(true);
      setError('');

      try {
        const machineRow = await getMachineById(id);

        if (!machineRow) {
          throw new Error(t('history.machineNotFound'));
        }

        const bundle = await getMachineHistoryBundle(machineRow);

        if (!active) {
          return;
        }

        setMachine(bundle.machine);
        setMovements(bundle.movements);
        setTrajectory(bundle.trajectory);
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

    loadMachine();

    return () => {
      active = false;
    };
  }, [id, t]);

  return (
    <div className={`min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 ${isRTL ? 'text-right' : 'text-left'}`}>
      <Header />

      <main className="page-shell py-6 sm:py-8 lg:py-10">
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">{t('history.loading')}</div>
        ) : error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>
        ) : (
          <div className="space-y-6">
            <section className="rounded-[2rem] bg-white p-4 shadow-panel sm:p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{getCategoryLabel(machine.categorie)}</div>
              <h1 className="mt-3 text-3xl text-slate-950 sm:text-4xl">{machine.numero_parc}</h1>
              <p className="mt-3 text-sm text-slate-500">
                {machine.marque || '-'} • {machine.modele || '-'}
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t('history.currentLocation')}</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900">{machine.localisation_actuelle || '-'}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t('history.currentStatus')}</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900">{machine.statut_actuel || '-'}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t('history.totalMovements')}</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900">{movements.length}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t('history.lastMovement')}</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900">
                    {movements[0]?.date_mouvement ? new Date(movements[0].date_mouvement).toLocaleDateString() : '-'}
                  </div>
                </div>
              </div>
            </section>

            <TrajectorySummary trajectory={trajectory} />
            <HistoryTimeline movements={movements} />
          </div>
        )}
      </main>
    </div>
  );
}

export default MachineDetailsPage;
