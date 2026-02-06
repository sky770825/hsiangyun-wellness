/**
 * 將後台儲存的網站主題套用到整站（前後台共用）
 * 後台修改字形、字級、顏色後，前端會依此顯示
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { SiteTheme } from './types';
import { loadTheme, saveTheme } from './store';
import { DEFAULT_THEME } from './theme-defaults';

function applyThemeToDocument(theme: SiteTheme) {
  const root = document.documentElement;
  root.style.setProperty('--font-display-custom', theme.fontDisplay);
  root.style.setProperty('--font-body-custom', theme.fontBody);
  root.style.setProperty('--font-size-base', theme.fontSizeBase);
  root.style.setProperty('--font-size-heading', theme.fontSizeHeading);
  root.style.setProperty('--background', theme.colorBackground);
  root.style.setProperty('--foreground', theme.colorForeground);
  root.style.setProperty('--primary', theme.colorPrimary);
  root.style.setProperty('--secondary', theme.colorSecondary);
  root.style.setProperty('--accent', theme.colorAccent);
}

type ThemeContextValue = {
  theme: SiteTheme;
  setTheme: (theme: SiteTheme) => void;
  resetTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<SiteTheme>(() => loadTheme());

  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  const setTheme = useCallback((next: SiteTheme) => {
    setThemeState(next);
    saveTheme(next);
    applyThemeToDocument(next);
  }, []);

  const resetTheme = useCallback(() => {
    setTheme(DEFAULT_THEME);
  }, [setTheme]);

  const value = useMemo(
    () => ({ theme, setTheme, resetTheme }),
    [theme, setTheme, resetTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) return { theme: DEFAULT_THEME, setTheme: () => {}, resetTheme: () => {} };
  return ctx;
}
