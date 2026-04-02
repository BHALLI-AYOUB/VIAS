import { Filter, Search, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

function FilterBar({ filters, onChange, categories, localisations, selectedLocalisation }) {
  const { isRTL, t, getCategoryLabel } = useLanguage();

  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4">
      <div className={`mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-600 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
        <Filter className="h-4 w-4" />
        {t('filterBar.title')}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.3fr_0.85fr_0.95fr_auto]">
        <label className="relative block">
          <Search className={`pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
          <input
            type="search"
            value={filters.search}
            onChange={(event) => onChange('search', event.target.value)}
            placeholder={t('filterBar.searchPlaceholder')}
            className={`field-shell ${isRTL ? 'pr-11 text-right' : 'pl-11 text-left'}`}
          />
        </label>

        <select value={filters.category} onChange={(event) => onChange('category', event.target.value)} className={`field-shell ${isRTL ? 'text-right' : 'text-left'}`}>
          <option value="">{t('filterBar.allCategories')}</option>
          {categories.map((category) => (
            <option key={category.label} value={category.label}>
              {getCategoryLabel(category.label)}
            </option>
          ))}
        </select>

        <select
          value={filters.localisation}
          onChange={(event) => onChange('localisation', event.target.value)}
          className={`field-shell ${isRTL ? 'text-right' : 'text-left'}`}
        >
          <option value="">
            {selectedLocalisation ? t('filterBar.selectedSite', { site: selectedLocalisation }) : t('filterBar.allLocalisations')}
          </option>
          {localisations.map((localisation) => (
            <option key={localisation} value={localisation}>
              {localisation}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => onChange('reset')}
          className={`inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <X className="h-4 w-4" />
          {t('filterBar.reset')}
        </button>
      </div>
    </div>
  );
}

export default FilterBar;
