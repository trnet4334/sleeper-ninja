import { useEffect, useState } from "react";
import type { NewsCardItem } from "@/components/ui/NewsCard";
import type { InjuryCardItem } from "@/components/ui/InjuryCard";

interface NewsApiResponse<T> {
  items: T[];
  updatedAt: string | null;
  source: string[];
}

interface UseNewsResult<T> {
  data: NewsApiResponse<T> | null;
  loading: boolean;
  error: string | null;
}

export function useProspectsNews(
  days = 7,
  cats: string[] = []
): UseNewsResult<NewsCardItem> {
  const [data, setData] = useState<NewsApiResponse<NewsCardItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ type: "prospects", days: String(days) });
    if (cats.length > 0) params.set("cats", cats.join(","));

    fetch(`/api/news?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<NewsApiResponse<NewsCardItem>>;
      })
      .then(setData)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [days, cats.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error };
}

export function useInjuryNews(
  days = 14,
  statuses: string[] = []
): UseNewsResult<InjuryCardItem> {
  const [data, setData] = useState<NewsApiResponse<InjuryCardItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ type: "injuries", days: String(days) });
    if (statuses.length > 0) params.set("cats", statuses.join(","));

    fetch(`/api/news?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<NewsApiResponse<InjuryCardItem>>;
      })
      .then(setData)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [days, statuses.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error };
}
