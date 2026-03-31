const defaultStatMapping: Record<string, string[]> = {
  AVG: ["xBA", "BABIP"],
  OBP: ["xwOBA", "BB%"],
  SLG: ["xSLG", "Barrel%", "EV"],
  HR: ["Barrel%", "HardHit%", "xSLG"],
  SB: ["Sprint Speed"],
  TB: ["xSLG", "EV"],
  BB: ["BB%", "Chase%"],
  K: ["Whiff%", "K%"],
  ERA: ["xERA", "xwOBA Against"],
  WHIP: ["BB%", "xwOBA Against"],
  QS: ["xFIP", "xERA"],
  "K/BB": ["K%", "BB%", "CSW%"],
  W: ["xFIP", "IP Trend"],
  SV: ["Role Tracking"],
  HLD: ["Role Tracking"],
  "SV+H": ["Role Tracking"],
  RAPP: ["Role Tracking", "ERA Context"],
  IP: ["IP Trend", "Start Probability"]
};

export function relatedStatsForCategory(category: string): string[] {
  return defaultStatMapping[category] ?? [category];
}

export function suggestedAdvancedStats(categories: string[]): string[] {
  return Array.from(new Set(categories.flatMap(relatedStatsForCategory)));
}
