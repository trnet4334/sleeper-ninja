import { useCategoryContext } from "@/hooks/useCategoryContext";

export function useStatPrefs() {
  const { activeLeague, activeStatPrefs, setStatPrefs } = useCategoryContext();

  return {
    leagueId: activeLeague.id,
    statPrefs: activeStatPrefs.advanced,
    daysBack: activeStatPrefs.daysBack,
    setStatPrefs
  };
}
