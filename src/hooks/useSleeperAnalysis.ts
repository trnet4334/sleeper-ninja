import { useEffect, useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { useStatPrefs } from "@/hooks/useStatPrefs";
import { fetchAnalysis, type AnalysisResponse } from "@/lib/apiClient";

export function useSleeperAnalysis(playerType: "hitter" | "pitcher") {
  const { leagueId, hitterCats, pitcherCats } = useCategories();
  const { statPrefs, daysBack } = useStatPrefs();
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const categories = playerType === "hitter" ? hitterCats : pitcherCats;

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
