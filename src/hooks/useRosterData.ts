import { useEffect, useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { useStatPrefs } from "@/hooks/useStatPrefs";
import { fetchPlayers, type PlayersResponse } from "@/lib/apiClient";

export function useRosterData(playerType: "hitter" | "pitcher" = "hitter") {
  const { leagueId, hitterCats, pitcherCats } = useCategories();
  const { statPrefs, daysBack } = useStatPrefs();
  const [data, setData] = useState<PlayersResponse | null>(null);

  useEffect(() => {
    const categories = playerType === "hitter" ? hitterCats : pitcherCats;
    void fetchPlayers({
      leagueId,
      playerType,
      cats: categories.join(","),
      stats: statPrefs.join(","),
      daysBack
    }).then(setData);
  }, [daysBack, hitterCats, leagueId, pitcherCats, playerType, statPrefs]);

  return {
    players: data?.players.filter((player) => player.rosterState === "roster") ?? []
  };
}
