import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './en.json';
import hi from './hi.json';
import kn from './kn.json';

const translations = { en, hi, kn };
const LANGUAGE_STORAGE_KEY = '@agrimind_language';

const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key, fallback) => fallback || key,
  availableLanguages: [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'kn', label: 'ಕನ್ನಡ' }
  ]
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('en');

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const saved = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (saved && translations[saved]) {
          setLanguageState(saved);
        }
      } catch (err) {
        console.warn('Failed to load saved language', err);
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = async (newLang) => {
    if (translations[newLang]) {
      setLanguageState(newLang);
      try {
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
      } catch (err) {
        console.warn('Failed to persist language', err);
      }
    }
  };

  const t = (key, fallback) => {
    const currentDict = translations[language] || translations.en;
    if (currentDict && currentDict[key] !== undefined && currentDict[key] !== '') {
      return currentDict[key];
    }
    const fallbackDict = translations.en;
    if (fallbackDict && fallbackDict[key] !== undefined && fallbackDict[key] !== '') {
      return fallbackDict[key];
    }
    return fallback !== undefined ? fallback : key;
  };

  const value = {
    language,
    setLanguage,
    t,
    availableLanguages: [
      { code: 'en', label: 'English' },
      { code: 'hi', label: 'हिंदी' },
      { code: 'kn', label: 'ಕನ್ನಡ' }
    ]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'en',
      setLanguage: () => {},
      t: (key, fallback) => fallback || key,
      availableLanguages: []
    };
  }
  return context;
};

export default useTranslation;
