import { createServerSupabaseClient } from "../../src/lib/supabase";
import type { DataQuery } from "./data";

// ---------------------------------------------------------------------------
// Batter column → display metric key mapping
// ---------------------------------------------------------------------------
const BATTER_DB_TO_METRIC: Record<string, string> = {
  avg: "AVG",
  obp: "OBP",
  hr: "HR",
  sb: "SB",
  tb: "TB",
  bb: "BB",
  xba: "xBA",
  xwoba: "xwOBA",
  xslg: "xSLG",
  barrel_pct: "Barrel%",
  hard_hit_pct: "HardHit%",
  ev_avg: "EV",
  sprint_speed: "Sprint Speed",
  k_pct: "K%",
  bb_pct: "BB%"
};

// ---------------------------------------------------------------------------
// Pitcher column → display metric key mapping
// ---------------------------------------------------------------------------
const PITCHER_DB_TO_METRIC: Record<string, string> = {
  era: "ERA",
  whip: "WHIP",
  k: "K",
  w: "W",
  sv: "SV",
  hld: "HLD",
  xera: "xERA",
  xfip: "xFIP",
  xwoba_against: "xwOBA",
  swstr_pct: "SwStr%",
  csw_pct: "CSW%",
  k_pct: "K%",
  bb_pct: "BB%"
};

export type DbPlayer = Record<string, unknown>;

export function mapDbPlayerToApi(
  row: DbPlayer,
  requestedMetrics: string[],
  columnMap: Record<string, string>
) {
  const metrics: Record<string, number | string> = {};
  for (const [col, key] of Object.entries(columnMap)) {
    if (requestedMetrics.includes(key) && row[col] != null) {
      metrics[key] = row[col] as number;
    }
  }
  return {
    id: String(row.player_id ?? ""),
    playerName: String(row.player_name ?? ""),
    team: String(row.team ?? ""),
    position: String(row.position ?? row.role ?? ""),
    playerType: (row.player_type ?? (columnMap === BATTER_DB_TO_METRIC ? "hitter" : "pitcher")) as
      | "hitter"
      | "pitcher",
    rosterState: "waiver" as const,
    metrics,
    trend: [] as number[],
    delta: 0,
    recommendationScore: 0
  };
}

export async function queryPlayersFromDb(
  query: DataQuery,
  requestedMetrics: string[],
  rosterState?: "waiver" | "roster"
) {
  void rosterState; // statcast tables don't have roster_state; handled by Yahoo layer

  const supabase = createServerSupabaseClient(process.env as Record<string, string | undefined>);
  if (!supabase) return null;

  const isHitter = query.playerType === "hitter";
  const table = isHitter ? "statcast_batters" : "statcast_pitchers";
  const columnMap = isHitter ? BATTER_DB_TO_METRIC : PITCHER_DB_TO_METRIC;
  const daysBack = query.daysBack ?? 14;

  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("days_back", daysBack)
    .order("player_name", { ascending: true });

  if (error || !data) return null;

  return (data as DbPlayer[]).map((row) => mapDbPlayerToApi(row, requestedMetrics, columnMap));
}
