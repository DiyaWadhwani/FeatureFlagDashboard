import { useEffect } from "react";
import { useTheme } from "next-themes";

export function useThemeFromFlags() {
  const { setTheme } = useTheme();

  useEffect(() => {
    fetch("http://localhost:3000/theme/config")
      .then((res) => res.json())
      .then(({ darkMode }) => {
        setTheme(darkMode ? "dark" : "light");
      });
  }, [setTheme]);
}
