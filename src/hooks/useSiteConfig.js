import { useState, useEffect, useMemo, useCallback } from "react";

function getApiBase() {
  if (typeof window === "undefined") return "";
  return window.location.hostname === "localhost"
    ? "http://localhost:5050"
    : "https://even-backend-f3n6.onrender.com";
}

export function useSiteConfig() {
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // чтобы не пересоздавался на каждый ререндер
  const API_BASE = useMemo(() => getApiBase(), []);

  const fetchSite = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/site`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSite(data);
      return data;
    } catch (err) {
      setError(err?.message || "Ошибка загрузки");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  const saveSite = useCallback(
    async (newData) => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_BASE}/site`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newData),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const updated = await res.json();
        setSite(updated);
        return updated;
      } catch (err) {
        setError(err?.message || "Ошибка сохранения");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [API_BASE]
  );

  useEffect(() => {
    fetchSite();
  }, [fetchSite]);

  return { site, loading, error, fetchSite, saveSite, API_BASE };
}
