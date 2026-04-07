import { useEffect, useState } from "react";

export interface YahooPlayer {
  playerKey: string;
  playerName: string;
  team: string;
  teamFull: string;
  position: string;
  eligiblePositions: string[];
  selectedPosition: string;
  isStarting: boolean;
  status: string;
  statusFull: string;
  injuryNote: string;
  headshotUrl: string;
  stats: Record<string, string>;
}

const PITCHER_POSITIONS = ["SP", "RP", "P"];

function isPitcher(position: string): boolean {
  return PITCHER_POSITIONS.some((pos) =>
    position.split(",").map((p) => p.trim()).includes(pos)
  );
}

export function useYahooRoster(yahooLeagueId: string): {
  hitters: YahooPlayer[];
  pitchers: YahooPlayer[];
  loading: boolean;
} {
  const [hitters, setHitters] = useState<YahooPlayer[]>([]);
  const [pitchers, setPitchers] = useState<YahooPlayer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!yahooLeagueId) {
      setHitters([]);
      setPitchers([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    async function load() {
      try {
        const response = await fetch(
          `/api/yahoo/roster?league_id=${encodeURIComponent(yahooLeagueId)}`
        );
        if (!response.ok) {
          if (!cancelled) { setHitters([]); setPitchers([]); setLoading(false); }
          return;
        }
        const payload = (await response.json()) as { roster: YahooPlayer[] };
        const roster = payload.roster ?? [];
        if (!cancelled) {
          setHitters(roster.filter((p) => !isPitcher(p.position)));
          setPitchers(roster.filter((p) => isPitcher(p.position)));
          setLoading(false);
        }
      } catch {
        if (!cancelled) { setHitters([]); setPitchers([]); setLoading(false); }
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [yahooLeagueId]);

  return { hitters, pitchers, loading };
}
