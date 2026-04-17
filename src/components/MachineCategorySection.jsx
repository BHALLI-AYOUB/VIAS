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
      <div className={`flex flex-col gap-3 md:flex-row md:justify-between md:gap-4 ${isRTL ? 'text-right' : ''}`}>
        <div>
          <h2 className="text-xl text-white sm:text-2xl">{t('machineCategorySection.title')}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">{t('machineCategorySection.description')}</p>
        </div>
        <div className="rounded-2xl border border-brand-300/20 bg-brand-400/10 px-4 py-3 text-sm text-brand-200 md:max-w-xs">
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
