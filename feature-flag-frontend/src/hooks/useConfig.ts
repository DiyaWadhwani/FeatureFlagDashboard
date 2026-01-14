import { useEffect, useState } from "react";

export type AppConfig = Record<string, boolean>;

export function useConfig() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/config")
      .then((res) => res.json())
      .then((json) => {
        setConfig(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { config, loading };
}
