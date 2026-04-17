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
    <article className="site-panel rounded-[1.75rem]">
      <div className="grid gap-0 md:grid-cols-[180px_minmax(0,1fr)]">
        <div className="bg-[linear-gradient(180deg,rgba(42,46,59,0.95),rgba(28,31,41,0.95))] p-4 md:p-5">
          <MachineImage
            category={category.label}
            alt={getCategoryLabel(category.label)}
            className="h-40 w-full sm:h-48 md:h-full md:min-h-[220px]"
          />
        </div>

        <div className={`min-w-0 p-4 sm:p-5 ${isRTL ? 'text-right' : ''}`}>
          <div className={`flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
            <div>
              <h3 className="text-lg text-white sm:text-xl">{getCategoryLabel(category.label)}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-400">{getCategoryDescription(category.label)}</p>
            </div>
            <div className={`flex flex-wrap gap-2 ${isRTL ? 'justify-end' : 'justify-start'}`}>
              <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-full border border-brand-300/20 bg-brand-400/10 px-3 text-xs font-semibold text-brand-200">
                {selectedIds.length}
              </span>
            </div>
          </div>

          <div className="site-subpanel mt-4 rounded-[1.35rem] p-4 sm:mt-5">
            <div
              className={`mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-200 ${
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
                  ? 'border-brand-300/30 bg-brand-400/10 text-brand-200'
                  : 'border-white/10 bg-[linear-gradient(180deg,rgba(27,30,41,0.92),rgba(17,19,27,0.94))] text-slate-200 hover:border-white/20 hover:bg-[#20222b]'
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
                      className="rounded-full border border-brand-300/20 bg-brand-400/10 px-3 py-1.5 text-xs font-semibold text-brand-200"
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
