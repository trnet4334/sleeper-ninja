export interface CategorySet {
  hitter: string[];
  pitcher: string[];
}

export interface StatPreferences {
  advanced: string[];
  daysBack: number;
}

export type CategoryMap = Record<string, CategorySet>;
export type StatPreferenceMap = Record<string, StatPreferences>;
