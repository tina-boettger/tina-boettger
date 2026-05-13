import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Language = "en" | "de";

interface LanguageContextValue {
  language: Language;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("inner-compass-language");
    return saved === "de" ? "de" : "en";
  });

  useEffect(() => {
    localStorage.setItem("inner-compass-language", language);
  }, [language]);

  return (
    <LanguageContext.Provider
      value={{
        language,
        toggleLanguage: () => setLanguage((current) => (current === "en" ? "de" : "en")),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
