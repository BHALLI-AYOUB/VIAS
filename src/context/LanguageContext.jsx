import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { translations } from '../i18n/translations';

const STORAGE_KEY = 'vias-language';
const LanguageContext = createContext(null);

function getValue(object, path) {
  return path.split('.').reduce((accumulator, part) => accumulator?.[part], object);
}

function interpolate(value, variables = {}) {
  if (typeof value !== 'string') {
    return value;
  }

  return value.replace(/\{(\w+)\}/g, (_, key) => variables[key] ?? `{${key}}`);
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => window.localStorage.getItem(STORAGE_KEY) || 'fr');
  const isRTL = language === 'ar';
  const locale = language === 'ar' ? 'ar-MA' : 'fr-FR';

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [isRTL, language]);

  const messages = translations[language] || translations.fr;

  const value = useMemo(() => {
    const t = (path, variables) => {
      const translated = getValue(messages, path) ?? getValue(translations.fr, path) ?? path;
      return interpolate(translated, variables);
    };

    const getCategoryMeta = (category) =>
      messages.machineCategories?.[category] || translations.fr.machineCategories?.[category] || { label: category, description: '' };

    return {
      language,
      setLanguage,
      isRTL,
      locale,
      messages,
      t,
      getCategoryLabel: (category) => getCategoryMeta(category).label || category,
      getCategoryDescription: (category) => getCategoryMeta(category).description || '',
    };
  }, [isRTL, language, messages]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }

  return context;
}
