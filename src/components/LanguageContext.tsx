
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations } from '@/lib/translations';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: any;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ar');
  const [isMounted, setIsMounted] = useState(false);
  const db = useFirestore();

  // Fetch Dynamic Content Overrides
  const cmsRef = useMemoFirebase(() => doc(db, 'system_settings', 'marketing'), [db]);
  const { data: cmsData } = useDoc(cmsRef);

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang && ['ar', 'en', 'rw', 'fr'].includes(savedLang)) {
      setLanguage(savedLang);
      document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = savedLang;
    }
    document.documentElement.style.visibility = 'visible';
    setIsMounted(true);
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  // Merge static translations with Firestore overrides
  const mergedTranslations = React.useMemo(() => {
    const base = JSON.parse(JSON.stringify(translations[language])); 
    if (!cmsData || !cmsData[language]) return base;

    const dynamic = cmsData[language];
    
    const sections = ['hero', 'about', 'membership', 'financial', 'contact', 'footer', 'nav', 'common', 'admin'];
    
    sections.forEach(section => {
      if (dynamic[section] && base[section]) {
        Object.keys(dynamic[section]).forEach(key => {
          if (dynamic[section][key]) {
            base[section][key] = dynamic[section][key];
          }
        });
      }
    });

    return base;
  }, [language, cmsData]);

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage: handleSetLanguage, 
      t: mergedTranslations,
      dir 
    }}>
      <div className={isMounted ? "opacity-100" : "opacity-0"}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
