import { useEffect, useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { useStatPrefs } from "@/hooks/useStatPrefs";
import { fetchAnalysis, type AnalysisResponse } from "@/lib/apiClient";

const DEFAULT_HITTER_CATS = ["HR", "SB", "AVG", "OBP", "BB", "TB"];
const DEFAULT_PITCHER_CATS = ["ERA", "WHIP", "K", "SV", "QS", "W"];

export function useSleeperAnalysis(playerType: "hitter" | "pitcher") {
  const { leagueId, hitterCats, pitcherCats } = useCategories();
  const { statPrefs, daysBack } = useStatPrefs();
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const raw = playerType === "hitter" ? hitterCats : pitcherCats;
    const defaults = playerType === "hitter" ? DEFAULT_HITTER_CATS : DEFAULT_PITCHER_CATS;
    const categories = raw.length > 0 ? raw : defaults;

    void fetchAnalysis({
      leagueId,
      playerType,
      cats: categories.join(","),
      stats: statPrefs.join(","),
      daysBack
    }).then((payload) => {
      if (!cancelled) {
        setData(payload);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [daysBack, hitterCats, leagueId, pitcherCats, playerType, statPrefs]);

  return { data, loading };
}
