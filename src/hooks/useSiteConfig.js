import { useState, useEffect } from "react";

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

  const API_BASE = getApiBase();

  // --- GET данные ---
  const fetchSite = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/site`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSite(data);
    } catch (err) {
      setError(err.message || "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  };

  // --- POST/PUT данные ---
  const saveSite = async (newData) => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/site`, {
        method: "PUT", // или POST, если сервер ожидает POST
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const updated = await res.json();
      setSite(updated);
      return updated;
    } catch (err) {
      setError(err.message || "Ошибка сохранения");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSite();
  }, []);

  return { site, loading, error, fetchSite, saveSite };
}