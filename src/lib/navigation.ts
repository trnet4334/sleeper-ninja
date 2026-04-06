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

export const leagueDefaults = [
  { id: "viva_el_birdos", name: "Viva el Birdos", yahooLeagueId: "12345", season: 2025 },
  { id: "lets_go_fans", name: "Lets Go Fans", yahooLeagueId: "23456", season: 2025 },
  { id: "league_3", name: "League 3", yahooLeagueId: "34567", season: 2025 }
];
