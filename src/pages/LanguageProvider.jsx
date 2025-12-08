import React, { createContext, useState, useEffect } from 'react';
import { translations } from './translations';

const LanguageContext = createContext();

const LanguageProvider = ({ children }) => {
  // Default language to 'ar'
  const [language, setLanguage] = useState(() => localStorage.getItem('lang') || 'ar');

  // Persist language to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('lang', language);
  }, [language]);

  const t = (key) => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export { LanguageProvider, LanguageContext };