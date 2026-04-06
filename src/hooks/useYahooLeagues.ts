import { useEffect, useState } from "react";
import type { LeagueDefinition } from "@/types/league";

export function useYahooLeagues(enabled: boolean): {
  leagues: LeagueDefinition[];
  loading: boolean;
} {
  const [leagues, setLeagues] = useState<LeagueDefinition[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setLeagues([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    async function load() {
      try {
        const response = await fetch("/api/yahoo/leagues");
        if (!response.ok) {
          if (!cancelled) { setLeagues([]); setLoading(false); }
          return;
        }
        const payload = (await response.json()) as { leagues: LeagueDefinition[] };
        if (!cancelled) {
          setLeagues(payload.leagues ?? []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) { setLeagues([]); setLoading(false); }
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [enabled]);

  return { leagues, loading };
}
