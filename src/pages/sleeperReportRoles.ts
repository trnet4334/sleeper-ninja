type SleeperPlayer = {
  playerType: "hitter" | "pitcher";
  position: string;
};

const HITTER_TABS = ["C", "1B", "2B", "3B", "SS", "OF", "DH", "UTIL"] as const;
const PITCHER_TABS = ["SP", "RP"] as const;

export type HitterSleeperTab = (typeof HITTER_TABS)[number];
export type PitcherSleeperTab = (typeof PITCHER_TABS)[number];
export type SleeperTab = HitterSleeperTab | PitcherSleeperTab;

function tokenizePositions(position: string) {
  return position
    .split(/[/,]/)
    .map((token) => token.trim().toUpperCase())
    .filter(Boolean);
}

function matchesHitterTab(tokens: string[], tab: HitterSleeperTab) {
  if (tab === "UTIL") return true;
  if (tab === "OF") {
    return tokens.some((token) => ["OF", "LF", "CF", "RF"].includes(token));
  }
  return tokens.includes(tab);
}

export function isPitcherSleeperTab(tab: SleeperTab): tab is PitcherSleeperTab {
  return (PITCHER_TABS as readonly string[]).includes(tab);
}

export function isHitterSleeperTab(tab: SleeperTab): tab is HitterSleeperTab {
  return (HITTER_TABS as readonly string[]).includes(tab);
}

export function filterSleeperPlayersByTab<T extends SleeperPlayer>(players: T[], tab: SleeperTab) {
  if (tab === "SP") {
    return players.filter((player) => player.playerType === "pitcher" && tokenizePositions(player.position).includes("SP"));
  }

  if (tab === "RP") {
    return players.filter((player) => {
      if (player.playerType !== "pitcher") return false;
      const tokens = tokenizePositions(player.position);
      return tokens.includes("RP") || tokens.includes("CL");
    });
  }

  return players.filter((player) => {
    if (player.playerType !== "hitter") return false;
    return matchesHitterTab(tokenizePositions(player.position), tab);
  });
}

export const sleeperTabs = [...HITTER_TABS, ...PITCHER_TABS] as const;
