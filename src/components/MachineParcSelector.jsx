import { CheckSquare2, Square, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

function MachineParcSelector({ category, machines, selectedIds, onToggleMachine }) {
  const { isRTL, t, getCategoryLabel } = useLanguage();
  const selectedMachines = machines.filter((machine) => selectedIds.includes(machine.id));

  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <div className={`mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <CheckSquare2 className="h-4 w-4" />
        {t('machineCard.parcSelectorTitle', { category: getCategoryLabel(category) })}
      </div>

      {selectedMachines.length ? (
        <div className="mb-4">
          <div className={`mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 ${isRTL ? 'text-right' : ''}`}>
            {t('machineCard.selectedParc')}
          </div>
          <div className={`flex flex-wrap gap-2 ${isRTL ? 'justify-end' : ''}`}>
            {selectedMachines.map((machine) => (
              <button
                key={`chip-${machine.id}`}
                type="button"
                onClick={() => onToggleMachine(category, machine.id)}
                className={`inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                <span>{machine.numeroParc}</span>
                <X className="h-3.5 w-3.5" />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid gap-3">
        {machines.map((machine) => {
          const checked = selectedIds.includes(machine.id);

          return (
            <label
              key={machine.id}
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${
                checked ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white hover:border-slate-300'
              } ${isRTL ? 'flex-row-reverse text-right' : ''}`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggleMachine(category, machine.id)}
                className="sr-only"
              />
              <div className={`mt-0.5 shrink-0 ${checked ? 'text-emerald-700' : 'text-slate-400'}`}>
                {checked ? <CheckSquare2 className="h-5 w-5" /> : <Square className="h-5 w-5" />}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-slate-900">{machine.numeroParc}</div>
                <div className="mt-1 text-sm text-slate-600">
                  {machine.marque || '-'} - {machine.type || '-'}
                </div>
                <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">{machine.localisation}</div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default MachineParcSelector;
