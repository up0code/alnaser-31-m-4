
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const db = useFirestore();

  const settingsRef = useMemoFirebase(() => doc(db, 'system_settings', 'config'), [db]);
  const { data: settings } = useDoc(settingsRef);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Helper to convert HEX to HSL and set CSS variable
  const applyColor = (variable: string, hex: string) => {
    if (!hex || !hex.startsWith('#')) return;
    
    const cleanHex = hex.replace('#', '');
    if (cleanHex.length !== 6 && cleanHex.length !== 3) return;

    const r = parseInt(cleanHex.length === 3 ? cleanHex[0] + cleanHex[0] : cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.length === 3 ? cleanHex[1] + cleanHex[1] : cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.length === 3 ? cleanHex[2] + cleanHex[2] : cleanHex.substring(4, 6), 16) / 255;
    
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    // Set variable in standard Tailwind format: H S% L%
    document.documentElement.style.setProperty(variable, `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`);
  };

  // Helper to clear an inline CSS variable
  const clearColor = (variable: string) => {
    document.documentElement.style.removeProperty(variable);
  };

  // Apply Global Settings (Font Size and Complete Color Palette)
  useEffect(() => {
    if (!settings) return;

    // Apply Font Size
    const fontSizes: Record<string, string> = {
      small: '14px',
      normal: '16px',
      large: '18px'
    };
    if (settings.fontSize) {
      document.documentElement.style.fontSize = fontSizes[settings.fontSize] || '16px';
    }

    // Apply Brand Colors (Primary/Accent always apply)
    if (settings.primaryColor) {
      applyColor('--primary', settings.primaryColor);
      applyColor('--chart-1', settings.primaryColor);
    }
    if (settings.accentColor) {
      applyColor('--accent', settings.accentColor);
      applyColor('--chart-2', settings.accentColor);
    }

    // Apply UI Colors (Only in Light Mode to prevent breaking Dark Mode variables)
    if (theme === 'light') {
      if (settings.backgroundColor) applyColor('--background', settings.backgroundColor);
      if (settings.cardColor) applyColor('--card', settings.cardColor);
      if (settings.textColor) applyColor('--foreground', settings.textColor);
      if (settings.secondaryColor) applyColor('--secondary', settings.secondaryColor);
    } else {
      // In Dark mode, remove specific UI overrides so CSS variables in globals.css .dark take over
      clearColor('--background');
      clearColor('--card');
      clearColor('--foreground');
      clearColor('--secondary');
    }

  }, [settings, theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
