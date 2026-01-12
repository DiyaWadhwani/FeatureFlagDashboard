import { useEffect } from "react";
import { useTheme } from "next-themes";

const POLL_INTERVAL_MS = 1000;

export function useThemeFromFlags() {
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    let cancelled = false;

    const syncTheme = async () => {
      try {
        const res = await fetch("http://localhost:3000/theme/config");
        const { darkMode } = await res.json();

        const desiredTheme = darkMode ? "dark" : "light";
        if (!cancelled && resolvedTheme !== desiredTheme) {
          setTheme(desiredTheme);
        }
      } catch (error) {
        console.error("Theme sync failed:", error);
      }
    };

    syncTheme();
    const intervalId = setInterval(syncTheme, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [resolvedTheme, setTheme]);
}
