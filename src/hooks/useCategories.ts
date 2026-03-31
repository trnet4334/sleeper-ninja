import { useCategoryContext } from "@/hooks/useCategoryContext";

export function useCategories() {
  const { activeLeague, activeCategories, setCategories, relatedStats } = useCategoryContext();

  return {
    leagueId: activeLeague.id,
    hitterCats: activeCategories.hitter,
    pitcherCats: activeCategories.pitcher,
    setCategories,
    relatedStats
  };
}
