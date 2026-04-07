import type { NavItem } from "@/types/navigation";

export const navItems: NavItem[] = [
  { label: "FA Sleeper Report", path: "/", section: "Fantasy HQ" },
  { label: "My Roster", path: "/roster", section: "Fantasy HQ" },
  { label: "Matchup Analysis", path: "/matchup", section: "Fantasy HQ" },
  { label: "Trade Analyzer", path: "/trade", section: "Tools" },
  { label: "Stat Explorer", path: "/explorer", section: "Tools" },
  { label: "Prospects News", path: "/news/prospects", section: "News" },
  { label: "Injury Update", path: "/news/injury", section: "News" },
  { label: "Settings", path: "/settings", section: "Config" }
];

import type { LeagueDefinition } from "@/types/league";

export const leagueDefaults: LeagueDefinition[] = [];
