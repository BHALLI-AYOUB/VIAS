import MachineCategoryCard from './MachineCategoryCard';
import { useLanguage } from '../context/LanguageContext';

function MachineCategorySection({
  categories,
  machinesByCategory,
  activeCategories,
  selectedMachineIdsByCategory,
  onToggleCategory,
  onToggleMachine,
}) {
  const { isRTL, t } = useLanguage();

  return (
    <section className="space-y-4 sm:space-y-5">
      <div className={`flex flex-col gap-3 md:flex-row md:items-end md:justify-between ${isRTL ? 'text-right' : ''}`}>
        <div>
          <h2 className="text-xl text-slate-950 sm:text-2xl">{t('machineCategorySection.title')}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t('machineCategorySection.description')}</p>
        </div>
        <div className="rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-900 md:max-w-xs">
          {t('machineCategorySection.note')}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {categories.map((category) => (
          <MachineCategoryCard
            key={category.label}
            category={category}
            machines={machinesByCategory[category.label] || []}
            isActive={Boolean(activeCategories[category.label])}
            selectedIds={selectedMachineIdsByCategory[category.label] || []}
            onToggleCategory={onToggleCategory}
            onToggleMachine={onToggleMachine}
          />
        ))}
      </div>
    </section>
  );
}

export default MachineCategorySection;
