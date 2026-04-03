import { Boxes, ChevronDown, ChevronUp } from 'lucide-react';
import MachineImage from './MachineImage';
import MachineParcSelector from './MachineParcSelector';
import { useLanguage } from '../context/LanguageContext';

function MachineCategoryCard({
  category,
  machines,
  isActive,
  selectedIds,
  onToggleCategory,
  onToggleMachine,
}) {
  const { isRTL, t, getCategoryLabel, getCategoryDescription } = useLanguage();
  const selectedMachines = machines.filter((machine) => selectedIds.includes(machine.id));

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-panel">
      <div className="grid gap-0 md:grid-cols-[220px_minmax(0,1fr)]">
        <div className="bg-gradient-to-br from-slate-50 to-white p-4 md:p-5">
          <MachineImage
            category={category.label}
            alt={getCategoryLabel(category.label)}
            className="h-40 w-full sm:h-52 md:h-full md:min-h-[220px]"
          />
        </div>

        <div className={`min-w-0 p-4 sm:p-5 ${isRTL ? 'text-right' : ''}`}>
          <div className={`flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            <div>
              <h3 className="text-lg text-slate-900 sm:text-xl">{getCategoryLabel(category.label)}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">{getCategoryDescription(category.label)}</p>
            </div>
            <div className={`flex flex-wrap gap-2 ${isRTL ? 'justify-end' : 'justify-start'}`}>
              <span className="badge border-emerald-200 bg-emerald-50 text-emerald-700">{selectedIds.length}</span>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:mt-5">
            <div
              className={`mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 ${
                isRTL ? 'flex-row-reverse' : ''
              }`}
            >
              <Boxes className="h-4 w-4" />
              {t('machineCard.availableMachines')}
            </div>

            <button
              type="button"
              onClick={() => onToggleCategory(category.label)}
              className={`inline-flex min-h-[50px] w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              } ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <span>
                {isActive ? t('machineCard.hideParcSelector') : t('machineCard.showParcSelector')}
              </span>
              {isActive ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {!isActive && selectedMachines.length ? (
              <div className={`mt-3 ${isRTL ? 'text-right' : ''}`}>
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {t('machineCard.selectedParc')}
                </div>
                <div className={`flex flex-wrap gap-2 ${isRTL ? 'justify-end' : ''}`}>
                  {selectedMachines.map((machine) => (
                    <span
                      key={`selected-${machine.id}`}
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800"
                    >
                      {machine.numeroParc}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {isActive ? (
              <MachineParcSelector
                category={category.label}
                machines={machines}
                selectedIds={selectedIds}
                onToggleMachine={onToggleMachine}
              />
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

export default MachineCategoryCard;
