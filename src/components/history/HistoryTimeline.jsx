import { Download, Printer } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import {
  downloadCsv,
  exportMovementsAsCsv,
  getMovementDateLabel,
  getMovementTone,
  getMovementTypeLabel,
} from '../../utils/historyHelpers';

function HistoryTimeline({ movements = [], compact = false }) {
  const { isRTL, t, locale } = useLanguage();

  const handleExport = () => {
    downloadCsv('machine-history.csv', exportMovementsAsCsv(movements));
  };

  return (
    <section className="space-y-4">
      <div className={`flex items-center justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div>
          <h2 className="text-2xl text-slate-950">{t('history.timelineTitle')}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {movements.length ? t('history.timelineCount', { count: movements.length }) : t('history.noResults')}
          </p>
        </div>
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button
            type="button"
            onClick={() => window.print()}
            className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <Printer className="h-4 w-4" />
            {t('history.print')}
          </button>
          <button
            type="button"
            onClick={handleExport}
            className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <Download className="h-4 w-4" />
            {t('history.export')}
          </button>
        </div>
      </div>

      {movements.length ? (
        <div className="space-y-3">
          {movements.map((movement) => (
            <article key={movement.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className={`flex flex-wrap items-start justify-between gap-3 ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{movement.numero_parc}</div>
                  <div className="mt-1 text-sm text-slate-500">{getMovementDateLabel(movement, locale)}</div>
                </div>
                <span className={`badge ${getMovementTone(movement.type_mouvement)}`}>
                  {getMovementTypeLabel(movement.type_mouvement, t)}
                </span>
              </div>

              <div className={`mt-4 grid gap-4 ${compact ? '' : 'md:grid-cols-2'} ${isRTL ? 'text-right' : ''}`}>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t('history.from')}</div>
                  <div className="mt-1 text-sm text-slate-700">{movement.localisation_depart || t('history.noDeparture')}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{t('history.to')}</div>
                  <div className="mt-1 text-sm text-slate-700">
                    {movement.localisation_arrivee || movement.chantier || t('history.noArrival')}
                  </div>
                </div>
              </div>

              {movement.remarque ? (
                <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">{movement.remarque}</div>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
          {t('history.noResults')}
        </div>
      )}
    </section>
  );
}

export default HistoryTimeline;
