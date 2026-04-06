import { json } from "./http.js";
import { relatedStatsForCategory } from "../../src/lib/statMapping.js";

export interface DataQuery {
  leagueId: string;
  playerType: "hitter" | "pitcher";
  categories: string[];
  stats: string[];
  daysBack: number;
  mode: "average" | "conservative" | "optimistic";
}

type SamplePlayer = {
  id: string;
  playerName: string;
  team: string;
  position: string;
  playerType: "hitter" | "pitcher";
  rosterState: "waiver" | "roster";
  metrics: Record<string, number | string>;
  trend: number[];
  delta: number;
  recommendationScore: number;
};

const samplePlayers: SamplePlayer[] = [
  {
    id: "jackson-chourio",
    playerName: "Jackson Chourio",
    team: "MIL",
    position: "OF",
    playerType: "hitter",
    rosterState: "waiver",
    metrics: {
      AVG: 0.294,
      OBP: 0.352,
      HR: 12,
      SB: 10,
      TB: 122,
      xBA: 0.318,
      xwOBA: 0.388,
      "Barrel%": 12.8,
      "HardHit%": 48.2,
      "Sprint Speed": 29.7,
      EV: 92.1
    },
    trend: [0.31, 0.33, 0.36, 0.37, 0.39],
    delta: 0.084,
    recommendationScore: 91
  },
  {
    id: "nolan-jones",
    playerName: "Nolan Jones",
    team: "COL",
    position: "OF",
    playerType: "hitter",
    rosterState: "waiver",
    metrics: {
      AVG: 0.301,
      OBP: 0.364,
      HR: 9,
      SB: 8,
      TB: 101,
      xBA: 0.312,
      xwOBA: 0.372,
      "Barrel%": 11.2,
      "HardHit%": 44.7,
      EV: 91.6
    },
    trend: [0.28, 0.3, 0.33, 0.34, 0.35],
    delta: 0.061,
    recommendationScore: 84
  },
  {
    id: "aaron-judge",
    playerName: "Aaron Judge",
    team: "NYY",
    position: "OF",
    playerType: "hitter",
    rosterState: "roster",
    metrics: {
      AVG: 0.318,
      OBP: 0.418,
      HR: 24,
      TB: 168,
      xBA: 0.334,
      xwOBA: 0.455,
      "Barrel%": 18.4,
      "HardHit%": 57.2,
      EV: 95.3
    },
    trend: [0.37, 0.39, 0.4, 0.43, 0.45],
    delta: 0.051,
    recommendationScore: 97
  },
  {
    id: "taj-bradley",
    playerName: "Taj Bradley",
    team: "TB",
    position: "SP",
    playerType: "pitcher",
    rosterState: "waiver",
    metrics: {
      ERA: 4.12,
      WHIP: 1.27,
      K: 92,
      QS: 8,
      W: 7,
      xERA: 3.46,
      xFIP: 3.29,
      "SwStr%": 14.9,
      "CSW%": 31.6,
      "K%": 29.1,
      "BB%": 8.3
    },
    trend: [4.2, 4.0, 3.8, 3.6, 3.5],
    delta: 0.66,
    recommendationScore: 88
  },
  {
    id: "ryan-pepiot",
    playerName: "Ryan Pepiot",
    team: "TB",
    position: "SP",
    playerType: "pitcher",
    rosterState: "waiver",
    metrics: {
      ERA: 4.06,
      WHIP: 1.22,
      K: 86,
      QS: 9,
      xERA: 3.52,
      xFIP: 3.41,
      "SwStr%": 13.1,
      "CSW%": 29.7,
      "K%": 27.2,
      "BB%": 7.7
    },
    trend: [4.3, 4.1, 3.9, 3.8, 3.6],
    delta: 0.54,
    recommendationScore: 83
  }
];

export function parseDataQuery(request: Request): DataQuery {
  const url = new URL(request.url);
  const leagueId = url.searchParams.get("leagueId") ?? "viva_el_birdos";
  const playerType = (url.searchParams.get("playerType") ?? "hitter") as DataQuery["playerType"];
  const categories = (url.searchParams.get("cats") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const stats = (url.searchParams.get("stats") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const daysBack = Number(url.searchParams.get("daysBack") ?? 14);
  const mode = (url.searchParams.get("mode") ?? "average") as DataQuery["mode"];

  return {
    leagueId,
    playerType,
    categories,
    stats,
    daysBack,
    mode
  };
}

export function expandStats(categories: string[], stats: string[]) {
  return Array.from(new Set([...stats, ...categories.flatMap((category) => relatedStatsForCategory(category))]));
}

export function queryPlayers(query: DataQuery, rosterState?: SamplePlayer["rosterState"]) {
  const selectedStats = expandStats(query.categories, query.stats);
  return samplePlayers
    .filter((player) => player.playerType === query.playerType)
    .filter((player) => (rosterState ? player.rosterState === rosterState : true))
    .map((player) => ({
      id: player.id,
      playerName: player.playerName,
      team: player.team,
      position: player.position,
      playerType: player.playerType,
      rosterState: player.rosterState,
      metrics: Object.fromEntries(
        Object.entries(player.metrics).filter(([key]) => query.categories.includes(key) || selectedStats.includes(key))
      ),
      trend: player.trend,
      delta: player.delta,
      recommendationScore: player.recommendationScore
    }))
    .sort((left, right) => right.recommendationScore - left.recommendationScore);
}

export function analysisSummary(query: DataQuery) {
  const players = queryPlayers(query, "waiver");
  const top = players[0];
  const hotPlayers = players.filter((player) => player.delta >= (query.playerType === "hitter" ? 0.05 : 0.5)).length;

  return {
    leagueId: query.leagueId,
    playerType: query.playerType,
    daysBack: query.daysBack,
    selectedCategories: query.categories,
    selectedStats: expandStats(query.categories, query.stats),
    summary: {
      availableFas: players.length,
      topDelta: top?.delta ?? 0,
      topPlayer: top?.playerName ?? null,
      hotPlayers,
      ilReturns: query.playerType === "hitter" ? 3 : 2
    },
    players
  };
}

export function matchupSummary(query: DataQuery) {
  const categories = query.categories.length > 0 ? query.categories : query.playerType === "pitcher" ? ["ERA", "WHIP", "K"] : ["HR", "SB", "OBP"];
  const weakCategories = categories.filter((_, index) => index % 2 === 0);
  const pickups = queryPlayers(
    {
      ...query,
      playerType: query.playerType === "pitcher" ? "pitcher" : "hitter",
      stats: expandStats(weakCategories, query.stats),
      categories: weakCategories
    },
    "waiver"
  ).slice(0, 3);

  const forecast = categories.map((category, index) => ({
    category,
    myValue: query.playerType === "pitcher" ? Number((3.1 + index * 0.2).toFixed(2)) : 8 + index,
    opponentValue: query.playerType === "pitcher" ? Number((3.0 + index * 0.24).toFixed(2)) : 9 + index,
    result: index % 3 === 0 ? "LOSS" : index % 3 === 1 ? "WIN" : "TOSS"
  }));

  return {
    leagueId: query.leagueId,
    mode: query.mode,
    opponent: "Midtown Mashers",
    forecast,
    weakCategories,
    pickups
  };
}

export function ok(payload: unknown) {
  return json(payload);
}

// ---------------------------------------------------------------------------
// Supabase-aware query with fallback to samplePlayers
// ---------------------------------------------------------------------------

export async function queryPlayersWithFallback(
  query: DataQuery,
  rosterState?: SamplePlayer["rosterState"]
) {
  const { queryPlayersFromDb, queryPlayersFromFile } = await import("./supabase.js");
  const selectedStats = expandStats(query.categories, query.stats);

  // 1. Try Supabase (configured via env vars)
  const live = await queryPlayersFromDb(query, selectedStats, rosterState);
  if (live !== null) return live;

  // 2. Try local file exports (populated by scripts/fetch_all.py)
  const fromFile = await queryPlayersFromFile(query, selectedStats);
  if (fromFile !== null) return fromFile;

  // 3. Fall back to hardcoded sample players
  return queryPlayers(query, rosterState);
}

export async function analysisSummaryAsync(query: DataQuery) {
  const players = await queryPlayersWithFallback(query, "waiver");
  const top = players[0];
  const hotPlayers = players.filter((p: { delta: number }) => p.delta >= (query.playerType === "hitter" ? 0.05 : 0.5)).length;
  return {
    leagueId: query.leagueId,
    playerType: query.playerType,
    daysBack: query.daysBack,
    selectedCategories: query.categories,
    selectedStats: expandStats(query.categories, query.stats),
    summary: {
      availableFas: players.length,
      topDelta: top?.delta ?? 0,
      topPlayer: top?.playerName ?? null,
      hotPlayers,
      ilReturns: query.playerType === "hitter" ? 3 : 2
    },
    players
  };
}

export async function matchupSummaryAsync(query: DataQuery) {
  const categories =
    query.categories.length > 0
      ? query.categories
      : query.playerType === "pitcher"
        ? ["ERA", "WHIP", "K"]
        : ["HR", "SB", "OBP"];
  const weakCategories = categories.filter((_, index) => index % 2 === 0);
  const pickups = (
    await queryPlayersWithFallback(
      { ...query, playerType: query.playerType === "pitcher" ? "pitcher" : "hitter", stats: expandStats(weakCategories, query.stats), categories: weakCategories },
      "waiver"
    )
  ).slice(0, 3);

  const forecast = categories.map((category, index) => ({
    category,
    myValue: query.playerType === "pitcher" ? Number((3.1 + index * 0.2).toFixed(2)) : 8 + index,
    opponentValue: query.playerType === "pitcher" ? Number((3.0 + index * 0.24).toFixed(2)) : 9 + index,
    result: (index % 3 === 0 ? "LOSS" : index % 3 === 1 ? "WIN" : "TOSS") as "WIN" | "LOSS" | "TOSS"
  }));

  return {
    leagueId: query.leagueId,
    mode: query.mode,
    opponent: "Midtown Mashers",
    forecast,
    weakCategories,
    pickups
  };
}
