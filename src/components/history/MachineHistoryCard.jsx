import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import TrajectorySummary from './TrajectorySummary';

function MachineHistoryCard({ machine, latestMovement, trajectory = [] }) {
  const { isRTL, t, getCategoryLabel, locale } = useLanguage();

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className={`flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between ${isRTL ? 'sm:flex-row-reverse text-right' : ''}`}>
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{getCategoryLabel(machine.categorie)}</div>
          <h2 className="mt-2 text-xl text-slate-950 sm:text-2xl">{machine.numero_parc}</h2>
          <p className="mt-2 text-sm text-slate-600">
            {machine.marque || '-'} • {machine.modele || '-'}
          </p>
        </div>

        <div className={`flex flex-col items-start gap-2 ${isRTL ? 'items-end' : ''}`}>
          <span className="badge border-emerald-200 bg-emerald-50 text-emerald-800">{machine.statut_actuel || 'disponible'}</span>
          <div className="text-sm text-slate-500">
            {t('history.currentLocation')}: {machine.localisation_actuelle || '-'}
          </div>
          {latestMovement ? (
            <div className="text-xs text-slate-400">
              {t('history.lastMovement')} {new Date(latestMovement.date_mouvement).toLocaleDateString(locale)}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4">
        <TrajectorySummary trajectory={trajectory} />
      </div>

      <div className={`mt-4 flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
        <Link
          to={`/machines/${machine.id}`}
          className={`inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          {t('history.viewDetails')}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

export default MachineHistoryCard;
