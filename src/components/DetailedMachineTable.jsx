import { CheckCircle2, Circle, Database } from 'lucide-react';
import FilterBar from './FilterBar';
import MachineImage from './MachineImage';
import { useLanguage } from '../context/LanguageContext';

function ToggleCell({ active, onToggle }) {
  const { t } = useLanguage();

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl border transition ${
        active
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-slate-200 bg-white text-slate-300 hover:border-slate-300 hover:text-slate-500'
      }`}
      aria-pressed={active}
      aria-label={active ? t('detailedTable.selectedAvailable') : t('detailedTable.selectAvailable')}
    >
      {active ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
    </button>
  );
}

function DetailedMachineTable({
  categories,
  localisations,
  machines,
  filters,
  onFilterChange,
  selections,
  onToggle,
  selectedLocalisation,
}) {
  const { isRTL, t, getCategoryLabel } = useLanguage();

  return (
    <section className="space-y-5">
      <div className={`flex flex-col gap-3 md:flex-row md:items-end md:justify-between ${isRTL ? 'text-right' : ''}`}>
        <div>
          <h2 className="text-2xl text-slate-950">{t('detailedTable.title')}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t('detailedTable.description')}</p>
        </div>
        <div className={`inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Database className="h-4 w-4 text-brand-600" />
          {t('detailedTable.visibleMachines', { count: machines.length })}
        </div>
      </div>

      <FilterBar
        filters={filters}
        onChange={onFilterChange}
        categories={categories}
        localisations={localisations}
        selectedLocalisation={selectedLocalisation}
      />

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="hidden overflow-x-auto lg:block">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr className={`text-xs uppercase tracking-[0.18em] text-slate-500 ${isRTL ? 'text-right' : 'text-left'}`}>
                <th className="px-4 py-4">{t('detailedTable.headers.image')}</th>
                <th className="px-4 py-4">{t('detailedTable.headers.category')}</th>
                <th className="px-4 py-4">{t('detailedTable.headers.parc')}</th>
                <th className="px-4 py-4">{t('detailedTable.headers.brand')}</th>
                <th className="px-4 py-4">{t('detailedTable.headers.model')}</th>
                <th className="px-4 py-4">{t('detailedTable.headers.localisation')}</th>
                <th className="px-4 py-4 text-center">{t('detailedTable.headers.available')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {machines.map((machine) => (
                <tr key={machine.id} className="align-top hover:bg-slate-50/80">
                  <td className="px-4 py-4">
                    <MachineImage category={machine.categorie} alt={getCategoryLabel(machine.categorie)} className="h-16 w-20" />
                  </td>
                  <td className="px-4 py-4">
                    <span className="badge border-brand-200 bg-brand-50 text-brand-900">{getCategoryLabel(machine.categorie)}</span>
                  </td>
                  <td className="px-4 py-4 font-semibold text-slate-900">{machine.numeroParc}</td>
                  <td className="px-4 py-4 text-slate-700">{machine.marque || '-'}</td>
                  <td className="px-4 py-4 text-slate-700">{machine.type || '-'}</td>
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="text-slate-700">{machine.localisation}</div>
                      {machine.sourceSheet ? <div className="text-xs text-slate-400">{machine.sourceSheet}</div> : null}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <ToggleCell active={selections.includes(machine.id)} onToggle={() => onToggle(machine.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 p-4 lg:hidden">
          {machines.map((machine) => (
            <article key={machine.id} className={`rounded-2xl border border-slate-200 p-4 ${isRTL ? 'text-right' : ''}`}>
              <div className="grid gap-4 sm:grid-cols-[112px_minmax(0,1fr)]">
                <MachineImage category={machine.categorie} alt={getCategoryLabel(machine.categorie)} className="h-28 w-full" />
                <div className={`flex flex-wrap items-start justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div>
                    <div className="badge border-brand-200 bg-brand-50 text-brand-900">{getCategoryLabel(machine.categorie)}</div>
                    <h3 className="mt-3 text-lg font-semibold text-slate-900">{machine.numeroParc}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {machine.marque || '-'} {t('detailedTable.separator')} {machine.type || '-'}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">{machine.localisation}</p>
                  </div>
                  <ToggleCell active={selections.includes(machine.id)} onToggle={() => onToggle(machine.id)} />
                </div>
              </div>
            </article>
          ))}
        </div>

        {!machines.length ? (
          <div className="border-t border-slate-200 px-6 py-10 text-center text-sm text-slate-500">
            {t('detailedTable.noResults')}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default DetailedMachineTable;
