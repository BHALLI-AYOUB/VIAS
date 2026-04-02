import FormField from '../FormField';
import { useLanguage } from '../../context/LanguageContext';

function HistoryFilters({ filters, options, onChange, onReset }) {
  const { isRTL, t } = useLanguage();

  return (
    <section className={`rounded-3xl border border-slate-200 bg-white p-5 shadow-sm ${isRTL ? 'text-right' : ''}`}>
      <div className={`flex flex-wrap items-center justify-between gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div>
          <h2 className="text-2xl text-slate-950">{t('history.filtersTitle')}</h2>
          <p className="mt-1 text-sm text-slate-500">{t('history.filtersDescription')}</p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
        >
          {t('history.resetFilters')}
        </button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FormField label={t('history.search')} htmlFor="history-search">
          <input
            id="history-search"
            value={filters.search}
            onChange={(event) => onChange('search', event.target.value)}
            className={`field-shell ${isRTL ? 'text-right' : 'text-left'}`}
            placeholder={t('history.searchPlaceholder')}
          />
        </FormField>

        <FormField label={t('history.category')} htmlFor="history-category">
          <select
            id="history-category"
            value={filters.categorie}
            onChange={(event) => onChange('categorie', event.target.value)}
            className={`field-shell ${isRTL ? 'text-right' : 'text-left'}`}
          >
            <option value="">{t('history.allCategories')}</option>
            {options.categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label={t('history.currentLocation')} htmlFor="history-current-location">
          <select
            id="history-current-location"
            value={filters.localisationActuelle}
            onChange={(event) => onChange('localisationActuelle', event.target.value)}
            className={`field-shell ${isRTL ? 'text-right' : 'text-left'}`}
          >
            <option value="">{t('history.allLocations')}</option>
            {options.locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label={t('history.movementType')} htmlFor="history-type">
          <select
            id="history-type"
            value={filters.typeMouvement}
            onChange={(event) => onChange('typeMouvement', event.target.value)}
            className={`field-shell ${isRTL ? 'text-right' : 'text-left'}`}
          >
            <option value="">{t('history.allMovementTypes')}</option>
            {options.movementTypes.map((type) => (
              <option key={type} value={type}>
                {t(`history.movementTypes.${type}`)}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label={t('history.from')} htmlFor="history-from">
          <select
            id="history-from"
            value={filters.localisationDepart}
            onChange={(event) => onChange('localisationDepart', event.target.value)}
            className={`field-shell ${isRTL ? 'text-right' : 'text-left'}`}
          >
            <option value="">{t('history.allLocations')}</option>
            {options.locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label={t('history.to')} htmlFor="history-to">
          <select
            id="history-to"
            value={filters.localisationArrivee}
            onChange={(event) => onChange('localisationArrivee', event.target.value)}
            className={`field-shell ${isRTL ? 'text-right' : 'text-left'}`}
          >
            <option value="">{t('history.allLocations')}</option>
            {options.locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label={t('history.startDate')} htmlFor="history-start-date">
          <input
            id="history-start-date"
            type="date"
            value={filters.dateStart}
            onChange={(event) => onChange('dateStart', event.target.value)}
            className={`field-shell ${isRTL ? 'text-right' : 'text-left'}`}
          />
        </FormField>

        <FormField label={t('history.endDate')} htmlFor="history-end-date">
          <input
            id="history-end-date"
            type="date"
            value={filters.dateEnd}
            onChange={(event) => onChange('dateEnd', event.target.value)}
            className={`field-shell ${isRTL ? 'text-right' : 'text-left'}`}
          />
        </FormField>
      </div>
    </section>
  );
}

export default HistoryFilters;
