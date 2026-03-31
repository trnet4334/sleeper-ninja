import { createContext } from "react";
import type { CategorySet, StatPreferences } from "@/types/category";
import type { LeagueDefinition } from "@/types/league";

export interface CategoryContextValue {
  leagues: LeagueDefinition[];
  activeLeague: LeagueDefinition;
  activeLeagueId: string;
  activeCategories: CategorySet;
  activeStatPrefs: StatPreferences;
  setActiveLeague: (leagueId: string) => void;
  addLeague: (league: LeagueDefinition) => void;
  removeLeague: (leagueId: string) => void;
  setCategories: (categories: CategorySet) => void;
  setStatPrefs: (preferences: StatPreferences) => void;
  relatedStats: (category: string) => string[];
  suggestedAdvancedStats: string[];
}

export const CategoryContext = createContext<CategoryContextValue | null>(null);
