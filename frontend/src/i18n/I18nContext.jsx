import { createContext, useContext, useMemo } from "react";
import { translations } from "./translations";

const I18nContext = createContext({
  language: "en",
  t: (key) => key,
});

export function I18nProvider({ language, children }) {
  const value = useMemo(() => {
    const dict = translations[language] || translations.en;
    return {
      language,
      t: (key) => dict[key] ?? translations.en[key] ?? key,
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}

