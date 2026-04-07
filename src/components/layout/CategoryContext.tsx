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
  const [activeLeagueId, setActiveLeagueId] = useState<string | null>(() => getActiveLeague("") || null);
  const [categoryMapState, setCategoryMapState] = useState(() => getCategoryMap(defaultCategoryMap));
  const [statPrefsState, setStatPrefsState] = useState(() => getStatPrefs(defaultStatPreferences));

  const activeLeague = useMemo(
    () => leagues.find((league) => league.id === activeLeagueId) ?? (leagues[0] ?? null),
    [activeLeagueId, leagues]
  );

  const activeCategories = useMemo(
    () => (activeLeague ? categoryMapState[activeLeague.id] : undefined) ?? { hitter: [], pitcher: [] },
    [activeLeague, categoryMapState]
  );
  const activeStatPrefs = useMemo(
    () => (activeLeague ? statPrefsState[activeLeague.id] : undefined) ?? { advanced: [], daysBack: 14 },
    [activeLeague, statPrefsState]
  );

  const handleSetActiveLeague = useCallback((leagueId: string) => {
    setActiveLeagueId(leagueId);
    setActiveLeague(leagueId);
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

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
    setLeagueState(nextLeagues);
    setLeagues(nextLeagues);

    if (activeLeagueId === leagueId) {
      const nextActive = nextLeagues[0]?.id ?? null;
      setActiveLeagueId(nextActive);
      if (nextActive) setActiveLeague(nextActive);
    }
  }, [activeLeagueId, leagues]);

  const handleSetCategories = useCallback((categories: CategorySet) => {
    if (!activeLeague) return;
    const nextMap = updateCategorySet(categoryMapState, activeLeague.id, categories);
    setCategoryMapState(nextMap);
    setCategoryMap(nextMap);
  }, [activeLeague, categoryMapState]);

  const handleSetStatPrefs = useCallback((preferences: StatPreferences) => {
    if (!activeLeague) return;
    const nextPrefs = updateStatPreference(statPrefsState, activeLeague.id, preferences);
    setStatPrefsState(nextPrefs);
    setStatPrefs(nextPrefs);
  }, [activeLeague, statPrefsState]);

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
