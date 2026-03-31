import { handler as analysisHandler } from "../../api/data/analysis";
import { handler as matchupHandler } from "../../api/data/matchup";
import { handler as playersHandler } from "../../api/data/players";

type QueryValue = string | number | undefined;

function buildUrl(path: string, query: Record<string, QueryValue>) {
  const url = new URL(path, "http://localhost");
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === "") {
      return;
    }
    url.searchParams.set(key, String(value));
  });
  return url.toString();
}

async function resolveJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }
  return (await response.json()) as T;
}

export interface PlayersResponse {
  status: "ok";
  leagueId: string;
  playerType: "hitter" | "pitcher";
  categories: string[];
  stats: string[];
  daysBack: number;
  players: Array<{
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
  }>;
}

export interface AnalysisResponse {
  status: "ok";
  leagueId: string;
  playerType: "hitter" | "pitcher";
  daysBack: number;
  selectedCategories: string[];
  selectedStats: string[];
  summary: {
    availableFas: number;
    topDelta: number;
    topPlayer: string | null;
    hotPlayers: number;
    ilReturns: number;
  };
  players: PlayersResponse["players"];
}

export interface MatchupResponse {
  status: "ok";
  leagueId: string;
  mode: "average" | "conservative" | "optimistic";
  opponent: string;
  forecast: Array<{
    category: string;
    myValue: number;
    opponentValue: number;
    result: "WIN" | "LOSS" | "TOSS";
  }>;
  weakCategories: string[];
  pickups: PlayersResponse["players"];
}

export async function fetchPlayers(query: Record<string, QueryValue>) {
  const response = await playersHandler(new Request(buildUrl("/api/data/players", query)));
  return resolveJson<PlayersResponse>(response);
}

export async function fetchAnalysis(query: Record<string, QueryValue>) {
  const response = await analysisHandler(new Request(buildUrl("/api/data/analysis", query)));
  return resolveJson<AnalysisResponse>(response);
}

export async function fetchMatchup(query: Record<string, QueryValue>) {
  const response = await matchupHandler(new Request(buildUrl("/api/data/matchup", query)));
  return resolveJson<MatchupResponse>(response);
}
