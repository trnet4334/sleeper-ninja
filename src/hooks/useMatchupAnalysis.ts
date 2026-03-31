import { useEffect, useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { useStatPrefs } from "@/hooks/useStatPrefs";
import { fetchMatchup, type MatchupResponse } from "@/lib/apiClient";

export function useMatchupAnalysis(playerType: "hitter" | "pitcher", mode: MatchupResponse["mode"]) {
  const { leagueId, hitterCats, pitcherCats } = useCategories();
  const { statPrefs, daysBack } = useStatPrefs();
  const [data, setData] = useState<MatchupResponse | null>(null);

  useEffect(() => {
    const categories = playerType === "hitter" ? hitterCats : pitcherCats;
    void fetchMatchup({
      leagueId,
      playerType,
      cats: categories.join(","),
      stats: statPrefs.join(","),
      daysBack,
      mode
    }).then(setData);
  }, [daysBack, hitterCats, leagueId, mode, pitcherCats, playerType, statPrefs]);

  return data;
}
