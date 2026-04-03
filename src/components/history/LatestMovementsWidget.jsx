import { useLanguage } from '../../context/LanguageContext';
import { getMovementDateLabel, getMovementTypeLabel } from '../../utils/historyHelpers';

function LatestMovementsWidget({ movements = [], loading }) {
  const { isRTL, t, locale } = useLanguage();

  return (
    <section className={`rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 ${isRTL ? 'text-right' : ''}`}>
      <h2 className="text-xl text-slate-950 sm:text-2xl">{t('history.latestMovements')}</h2>
      <p className="mt-1 text-sm text-slate-500">{t('history.latestMovementsDescription')}</p>

      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">{t('history.loading')}</div>
        ) : movements.length ? (
          movements.map((movement) => (
            <div key={movement.id} className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-900">{movement.numero_parc}</div>
              <div className="mt-1 text-sm text-slate-600">
                {getMovementTypeLabel(movement.type_mouvement, t)} • {movement.localisation_depart || '-'} → {movement.localisation_arrivee || movement.chantier || '-'}
              </div>
              <div className="mt-1 text-xs text-slate-400">{getMovementDateLabel(movement, locale)}</div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">{t('history.noResults')}</div>
        )}
      </div>
    </section>
  );
}

export default LatestMovementsWidget;
