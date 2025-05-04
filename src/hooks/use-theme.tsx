
import { useEffect, useState } from "react";
import { useLocalStorage } from "./use-local-storage";

type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useLocalStorage<Theme>("theme", "light");
  const [systemTheme, setSystemTheme] = useState<Theme | null>(null);

  // Detecta preferência do sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemTheme(mediaQuery.matches ? "dark" : "light");

    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  // Aplica tema ao documento
  useEffect(() => {
    const root = window.document.documentElement;
    
    const isDark = theme === "dark";
    root.classList.toggle("dark", isDark);
    
    // Atualiza a meta tag de theme-color para cor adequada do tema
    const metaThemeColor = document.querySelector("meta[name=theme-color]");
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", isDark ? "#1A1F2C" : "#ffffff");
    }
  }, [theme]);

  // Toggle entre temas
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return {
    theme,
    systemTheme,
    isDark: theme === "dark",
    toggleTheme,
    setTheme,
  };
}
