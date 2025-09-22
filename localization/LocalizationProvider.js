import React, { createContext, useMemo, useState, useEffect } from 'react';
import translations from '../i18n/translations';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const LocalizationContext = createContext({ t: (k) => k, language: 'en', setLanguage: () => {} });

export function LocalizationProvider({ children }) {
  const [languageState, setLanguageState] = useState('en');

  // Load saved language on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('language');
        if (mounted && saved) {
          setLanguageState(saved);
        }
      } catch (err) {
        console.warn('LocalizationProvider: failed to load language', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // setter that also persists
  const setLanguage = (lang) => {
    try {
      setLanguageState(lang);
      AsyncStorage.setItem('language', lang).catch((err) => {
        console.warn('LocalizationProvider: failed to save language', err);
      });
    } catch (err) {
      console.warn('LocalizationProvider: setLanguage error', err);
    }
  };

  const value = useMemo(() => ({
    language: languageState,
    setLanguage,
    t: (key) => {
      return translations[languageState] && translations[languageState][key] ? translations[languageState][key] : key;
    }
  }), [languageState]);

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

export default LocalizationProvider;
