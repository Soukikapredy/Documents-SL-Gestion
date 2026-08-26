"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Theme = "midnight" | "light" | "sky" | "emerald";

export const THEME_LABELS: Record<Theme, string> = {
  midnight: "Noir & bleu",
  light: "Blanc classique",
  sky: "Bleu clair",
  emerald: "Vert émeraude",
};

const VALID: Theme[] = ["midnight", "light", "sky", "emerald"];

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("midnight");

  useEffect(() => {
    const stored = window.localStorage.getItem("spl-theme") as Theme | null;
    const next = stored && VALID.includes(stored) ? stored : "midnight";
    setThemeState(next);
    document.documentElement.dataset.theme = next;
  }, []);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("spl-theme", next);
  };

  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme doit être utilisé dans ThemeProvider");
  return ctx;
}
