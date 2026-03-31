import type { CategoryMap, StatPreferenceMap } from "@/types/category";

export const defaultCategoryMap: CategoryMap = {
  viva_el_birdos: {
    hitter: ["R", "HR", "RBI", "SB", "TB", "AVG", "OBP"],
    pitcher: ["W", "SV", "K", "HLD", "ERA", "WHIP", "QS"]
  },
  lets_go_fans: {
    hitter: ["H", "SB", "BB", "K", "TB", "AVG", "OBP", "SLG"],
    pitcher: ["IP", "K", "ERA", "WHIP", "K/BB", "RAPP", "QS", "SV+H"]
  },
  league_3: {
    hitter: ["R", "HR", "RBI", "SB", "AVG"],
    pitcher: ["W", "K", "ERA", "WHIP", "SV"]
  }
};

export const defaultStatPreferences: StatPreferenceMap = {
  viva_el_birdos: {
    advanced: ["xBA", "xSLG", "Barrel%", "HardHit%", "xERA", "SwStr%"],
    daysBack: 14
  },
  lets_go_fans: {
    advanced: ["xwOBA", "BB%", "Sprint Speed", "CSW%", "xERA"],
    daysBack: 14
  },
  league_3: {
    advanced: ["xBA", "Barrel%", "xERA"],
    daysBack: 7
  }
};
