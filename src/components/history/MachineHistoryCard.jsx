import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import TrajectorySummary from './TrajectorySummary';

function MachineHistoryCard({ machine, latestMovement, trajectory = [] }) {
  const { isRTL, t, getCategoryLabel, locale } = useLanguage();

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`flex flex-wrap items-start justify-between gap-4 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{getCategoryLabel(machine.categorie)}</div>
          <h2 className="mt-2 text-2xl text-slate-950">{machine.numero_parc}</h2>
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

      <div className={`mt-4 flex justify-end ${isRTL ? 'justify-start' : ''}`}>
        <Link
          to={`/machines/${machine.id}`}
          className={`inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          {t('history.viewDetails')}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

export default MachineHistoryCard;
