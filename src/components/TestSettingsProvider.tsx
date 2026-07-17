'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AppearanceMode = 'NBME Official';
type ColorTheme = 'light' | 'dark'; // Dark is "Reverse Color"

export interface TestSettings {
  appearance: AppearanceMode;
  fontSize: number;
  colorTheme: ColorTheme;
  showTimer: boolean;
  splitScreen: boolean;
  confirmOmission: boolean;
  defaultHighlighter: string;
  multicolorHighlighting: boolean;
  hidePercentage: boolean;
  addToFlashcard: boolean;
  addToNotebook: boolean;
  addToAnnotation: boolean;
  smartContextMenu: boolean;
  answerElimination: boolean;
}

interface TestSettingsContextType {
  settings: TestSettings;
  updateSetting: <K extends keyof TestSettings>(key: K, value: TestSettings[K]) => void;
}

const defaultSettings: TestSettings = {
  appearance: 'NBME Official',
  fontSize: 15,
  colorTheme: 'light',
  showTimer: true,
  splitScreen: false,
  confirmOmission: true,
  defaultHighlighter: 'yellow',
  multicolorHighlighting: false, // NBME typically only has one highlight color natively, but keeping the engine is fine if we limit it
  hidePercentage: true,
  addToFlashcard: false,
  addToNotebook: true,
  addToAnnotation: false,
  smartContextMenu: false, // Turn off modern smart context menu for true NBME feel
  answerElimination: true,
};

const TestSettingsContext = createContext<TestSettingsContextType | undefined>(undefined);

export function TestSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<TestSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('testSettings');
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      } catch (e) {
        console.error('Failed to parse test settings', e);
      }
    }
    setIsLoaded(true);
  }, []);

  const updateSetting = <K extends keyof TestSettings>(key: K, value: TestSettings[K]) => {
    setSettings(prev => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem('testSettings', JSON.stringify(updated));
      return updated;
    });
  };

  if (!isLoaded) return null; // Prevent hydration mismatch

  return (
    <TestSettingsContext.Provider value={{ settings, updateSetting }}>
      {children}
    </TestSettingsContext.Provider>
  );
}

export function useTestSettings() {
  const context = useContext(TestSettingsContext);
  if (context === undefined) {
    throw new Error('useTestSettings must be used within a TestSettingsProvider');
  }
  return context;
}
