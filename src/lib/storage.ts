import type { LeagueDefinition } from "@/types/league";
import type { CategoryMap, CategorySet, StatPreferenceMap, StatPreferences } from "@/types/category";

const storageKeys = {
  leagues: "sleeper-ninja.leagues",
  activeLeague: "sleeper-ninja.active-league",
  categories: "sleeper-ninja.categories",
  statPrefs: "sleeper-ninja.stat-prefs"
} as const;

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  const value = window.localStorage.getItem(key);
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getLeagues(defaults: LeagueDefinition[]): LeagueDefinition[] {
  return safeRead(storageKeys.leagues, defaults);
}

export function setLeagues(value: LeagueDefinition[]): void {
  safeWrite(storageKeys.leagues, value);
}

export function getActiveLeague(defaultId: string): string {
  return safeRead(storageKeys.activeLeague, defaultId);
}

export function setActiveLeague(leagueId: string): void {
  safeWrite(storageKeys.activeLeague, leagueId);
}

export function getCategoryMap(defaults: Record<string, CategorySet>): Record<string, CategorySet> {
  return safeRead(storageKeys.categories, defaults);
}

export function setCategoryMap(value: Record<string, CategorySet>): void {
  safeWrite(storageKeys.categories, value);
}

export function getStatPrefs(defaults: Record<string, StatPreferences>): Record<string, StatPreferences> {
  return safeRead(storageKeys.statPrefs, defaults);
}

export function setStatPrefs(value: Record<string, StatPreferences>): void {
  safeWrite(storageKeys.statPrefs, value);
}

export function upsertLeague(leagues: LeagueDefinition[], league: LeagueDefinition): LeagueDefinition[] {
  const existingIndex = leagues.findIndex((item) => item.id === league.id);
  if (existingIndex === -1) {
    return [...leagues, league];
  }

  return leagues.map((item) => (item.id === league.id ? league : item));
}

export function removeLeague(leagues: LeagueDefinition[], leagueId: string): LeagueDefinition[] {
  return leagues.filter((league) => league.id !== leagueId);
}

export function updateCategorySet(
  categoryMap: CategoryMap,
  leagueId: string,
  nextCategories: CategorySet
): CategoryMap {
  return {
    ...categoryMap,
    [leagueId]: nextCategories
  };
}

export function updateStatPreference(
  statPrefs: StatPreferenceMap,
  leagueId: string,
  nextPreferences: StatPreferences
): StatPreferenceMap {
  return {
    ...statPrefs,
    [leagueId]: nextPreferences
  };
}
