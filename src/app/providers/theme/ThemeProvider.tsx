import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/app/stores/store";
import { setTheme, type Theme } from "@/app/stores/theme/theme.slice";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
}: ThemeProviderProps) {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.theme);

  useEffect(() => {
    const storedTheme = localStorage.getItem(storageKey) as Theme;
    if (storedTheme && storedTheme !== theme) {
      dispatch(setTheme(storedTheme));
    } else if (!storedTheme && theme !== defaultTheme) {
      dispatch(setTheme(defaultTheme));
    }
  }, [dispatch, theme, storageKey, defaultTheme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  return <>{children}</>;
}