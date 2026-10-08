/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const THEMES = ["emerald", "dark"] as const;
export type Theme = (typeof THEMES)[number];

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = "sw-theme";
const ThemeContext = createContext<ThemeContextType | null>(null);

function readStoredTheme(): Theme | null {
  try {
    if (typeof window !== "undefined" && window.location) {
      const p = new URLSearchParams(window.location.search).get("theme");
      if (p === "dark" || p === "gold") return "dark";
      if (p === "emerald" || p === "light") return "emerald";
    }
    const t = localStorage.getItem(STORAGE_KEY);
    if (t === "dark" || t === "gold") return "dark";
    if (t === "emerald" || t === "light") return "emerald";
    return null;
  } catch {
    return null;
  }
}

export interface ThemeProviderProps {
  defaultTheme?: Theme;
  children: ReactNode;
}

/** Sets <html data-theme="…">; every token in styles/index.css follows it. */
export function ThemeProvider({ defaultTheme = "emerald", children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme() ?? defaultTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage unavailable — theme still applies for this session */
    }
  }, [theme]);

  const value = useMemo<ThemeContextType>(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme((t) => THEMES[(THEMES.indexOf(t) + 1) % THEMES.length]),
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

export default ThemeProvider;
