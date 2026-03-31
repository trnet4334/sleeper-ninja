import {
  useCallback,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { CategoryContext } from "./category-context";
import { defaultCategoryMap, defaultStatPreferences } from "@/lib/defaults";
import { leagueDefaults } from "@/lib/navigation";
import {
  getActiveLeague,
  getCategoryMap,
  getLeagues,
  getStatPrefs,
  removeLeague,
  setActiveLeague,
  setCategoryMap,
  setLeagues,
  setStatPrefs,
  updateCategorySet,
  updateStatPreference,
  upsertLeague
} from "@/lib/storage";
import { relatedStatsForCategory, suggestedAdvancedStats } from "@/lib/statMapping";
import type { CategorySet, StatPreferences } from "@/types/category";
import type { LeagueDefinition } from "@/types/league";
import type { CategoryContextValue } from "./category-context";

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [leagues, setLeagueState] = useState<LeagueDefinition[]>(() => getLeagues(leagueDefaults));
  const [activeLeagueId, setActiveLeagueId] = useState(() => getActiveLeague(leagueDefaults[0].id));
  const [categoryMapState, setCategoryMapState] = useState(() => getCategoryMap(defaultCategoryMap));
  const [statPrefsState, setStatPrefsState] = useState(() => getStatPrefs(defaultStatPreferences));

  const activeLeague = useMemo(
    () => leagues.find((league) => league.id === activeLeagueId) ?? leagues[0],
    [activeLeagueId, leagues]
  );

  const activeCategories = useMemo(
    () => categoryMapState[activeLeague.id] ?? { hitter: [], pitcher: [] },
    [activeLeague.id, categoryMapState]
  );
  const activeStatPrefs = useMemo(
    () => statPrefsState[activeLeague.id] ?? { advanced: [], daysBack: 14 },
    [activeLeague.id, statPrefsState]
  );

  const handleSetActiveLeague = useCallback((leagueId: string) => {
    setActiveLeagueId(leagueId);
    setActiveLeague(leagueId);
  }, []);

  const handleAddLeague = useCallback((league: LeagueDefinition) => {
    const nextLeagues = upsertLeague(leagues, league);
    setLeagueState(nextLeagues);
    setLeagues(nextLeagues);

    if (!categoryMapState[league.id]) {
      const nextCategoryMap = updateCategorySet(categoryMapState, league.id, { hitter: [], pitcher: [] });
      setCategoryMapState(nextCategoryMap);
      setCategoryMap(nextCategoryMap);
    }

    if (!statPrefsState[league.id]) {
      const nextPrefs = updateStatPreference(statPrefsState, league.id, { advanced: [], daysBack: 14 });
      setStatPrefsState(nextPrefs);
      setStatPrefs(nextPrefs);
    }

    handleSetActiveLeague(league.id);
  }, [categoryMapState, handleSetActiveLeague, leagues, statPrefsState]);

  const handleRemoveLeague = useCallback((leagueId: string) => {
    const nextLeagues = removeLeague(leagues, leagueId);
    if (nextLeagues.length === 0) {
      return;
    }

    setLeagueState(nextLeagues);
    setLeagues(nextLeagues);

    if (activeLeagueId === leagueId) {
      handleSetActiveLeague(nextLeagues[0].id);
    }
  }, [activeLeagueId, handleSetActiveLeague, leagues]);

  const handleSetCategories = useCallback((categories: CategorySet) => {
    const nextMap = updateCategorySet(categoryMapState, activeLeague.id, categories);
    setCategoryMapState(nextMap);
    setCategoryMap(nextMap);
  }, [activeLeague.id, categoryMapState]);

  const handleSetStatPrefs = useCallback((preferences: StatPreferences) => {
    const nextPrefs = updateStatPreference(statPrefsState, activeLeague.id, preferences);
    setStatPrefsState(nextPrefs);
    setStatPrefs(nextPrefs);
  }, [activeLeague.id, statPrefsState]);

  const value = useMemo<CategoryContextValue>(
    () => ({
      leagues,
      activeLeague,
      activeLeagueId,
      activeCategories,
      activeStatPrefs,
      setActiveLeague: handleSetActiveLeague,
      addLeague: handleAddLeague,
      removeLeague: handleRemoveLeague,
      setCategories: handleSetCategories,
      setStatPrefs: handleSetStatPrefs,
      relatedStats: relatedStatsForCategory,
      suggestedAdvancedStats: suggestedAdvancedStats([...activeCategories.hitter, ...activeCategories.pitcher])
    }),
    [
      activeCategories,
      activeLeague,
      activeLeagueId,
      activeStatPrefs,
      handleAddLeague,
      handleRemoveLeague,
      handleSetActiveLeague,
      handleSetCategories,
      handleSetStatPrefs,
      leagues
    ]
  );

  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;
}
