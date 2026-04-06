var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/lib/supabase.ts
function readSupabaseEnv(env = import_meta.env) {
  return {
    url: env.VITE_SUPABASE_URL ?? env.SUPABASE_URL ?? "",
    anonKey: env.VITE_SUPABASE_ANON_KEY,
    serviceKey: env.SUPABASE_SERVICE_KEY
  };
}
function createServerSupabaseClient(env) {
  const config = readSupabaseEnv(env);
  if (!config.url || !config.serviceKey) {
    return null;
  }
  return (0, import_supabase_js.createClient)(config.url, config.serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
var import_supabase_js, import_meta;
var init_supabase = __esm({
  "src/lib/supabase.ts"() {
    import_supabase_js = require("@supabase/supabase-js");
    import_meta = {};
  }
});

// api/_shared/supabase.ts
var supabase_exports = {};
__export(supabase_exports, {
  mapDbPlayerToApi: () => mapDbPlayerToApi,
  queryPlayersFromDb: () => queryPlayersFromDb,
  queryPlayersFromFile: () => queryPlayersFromFile
});
function mapDbPlayerToApi(row, requestedMetrics, columnMap) {
  const metrics = {};
  for (const [col, key] of Object.entries(columnMap)) {
    if (requestedMetrics.includes(key) && row[col] != null) {
      metrics[key] = row[col];
    }
  }
  return {
    id: String(row.player_id ?? ""),
    playerName: String(row.player_name ?? ""),
    team: String(row.team ?? ""),
    position: String(row.position ?? row.role ?? ""),
    playerType: row.player_type ?? (columnMap === BATTER_DB_TO_METRIC ? "hitter" : "pitcher"),
    rosterState: "waiver",
    metrics,
    trend: [],
    // Batters: xwOBA − AVG (true talent vs current average)
    // Pitchers: ERA − xERA (how inflated ERA is vs expected; positive = buy-low opportunity)
    delta: columnMap === BATTER_DB_TO_METRIC ? (row.xwoba ?? 0) - (row.avg ?? 0) : (row.era ?? 0) - (row.xera ?? 0),
    recommendationScore: row.f_score ?? 0
  };
}
async function queryPlayersFromFile(query, requestedMetrics) {
  const isHitter = query.playerType === "hitter";
  const table = isHitter ? "statcast_batters" : "statcast_pitchers";
  const columnMap = isHitter ? BATTER_DB_TO_METRIC : PITCHER_DB_TO_METRIC;
  const daysBack = query.daysBack ?? 14;
  try {
    const baseUrl = typeof window !== "undefined" ? "" : "http://localhost:3001";
    const res = await fetch(`${baseUrl}/exports/${table}.json`);
    if (!res.ok) return null;
    const rows = await res.json();
    const filtered = rows.filter((r) => r.days_back === daysBack);
    if (filtered.length === 0) return null;
    return filtered.map((row) => mapDbPlayerToApi(row, requestedMetrics, columnMap));
  } catch {
    return null;
  }
}
async function queryPlayersFromDb(query, requestedMetrics, rosterState) {
  void rosterState;
  const env = typeof process !== "undefined" ? process.env : {};
  const supabase = createServerSupabaseClient(env);
  if (!supabase) return null;
  const isHitter = query.playerType === "hitter";
  const table = isHitter ? "statcast_batters" : "statcast_pitchers";
  const columnMap = isHitter ? BATTER_DB_TO_METRIC : PITCHER_DB_TO_METRIC;
  const daysBack = query.daysBack ?? 14;
  const { data, error } = await supabase.from(table).select("*").eq("days_back", daysBack).order("player_name", { ascending: true });
  if (error || !data) return null;
  return data.map((row) => mapDbPlayerToApi(row, requestedMetrics, columnMap));
}
var BATTER_DB_TO_METRIC, PITCHER_DB_TO_METRIC;
var init_supabase2 = __esm({
  "api/_shared/supabase.ts"() {
    init_supabase();
    BATTER_DB_TO_METRIC = {
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
      bb_pct: "BB%",
      ld_pct: "LD%",
      gb_pct: "GB%",
      whiff_pct: "Whiff%",
      sb_pct: "SB%",
      f_score: "F-Score"
    };
    PITCHER_DB_TO_METRIC = {
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
      bb_pct: "BB%",
      lob_pct: "LOB%",
      gb_pct: "GB%",
      hard_hit_pct: "HardHit%",
      f_score: "F-Score"
    };
  }
});

// api/data/analysis.ts
var analysis_exports = {};
__export(analysis_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(analysis_exports);

// api/_shared/http.ts
function json(payload, init) {
  return new Response(JSON.stringify(payload), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...init?.headers ?? {}
    }
  });
}

// src/lib/statMapping.ts
var defaultStatMapping = {
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
function relatedStatsForCategory(category) {
  return defaultStatMapping[category] ?? [category];
}

// api/_shared/data.ts
var samplePlayers = [
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
    trend: [4.2, 4, 3.8, 3.6, 3.5],
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
function parseDataQuery(request) {
  const url = new URL(request.url);
  const leagueId = url.searchParams.get("leagueId") ?? "viva_el_birdos";
  const playerType = url.searchParams.get("playerType") ?? "hitter";
  const categories = (url.searchParams.get("cats") ?? "").split(",").map((value) => value.trim()).filter(Boolean);
  const stats = (url.searchParams.get("stats") ?? "").split(",").map((value) => value.trim()).filter(Boolean);
  const daysBack = Number(url.searchParams.get("daysBack") ?? 14);
  const mode = url.searchParams.get("mode") ?? "average";
  return {
    leagueId,
    playerType,
    categories,
    stats,
    daysBack,
    mode
  };
}
function expandStats(categories, stats) {
  return Array.from(/* @__PURE__ */ new Set([...stats, ...categories.flatMap((category) => relatedStatsForCategory(category))]));
}
function queryPlayers(query, rosterState) {
  const selectedStats = expandStats(query.categories, query.stats);
  return samplePlayers.filter((player) => player.playerType === query.playerType).filter((player) => rosterState ? player.rosterState === rosterState : true).map((player) => ({
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
  })).sort((left, right) => right.recommendationScore - left.recommendationScore);
}
function ok(payload) {
  return json(payload);
}
async function queryPlayersWithFallback(query, rosterState) {
  const { queryPlayersFromDb: queryPlayersFromDb2, queryPlayersFromFile: queryPlayersFromFile2 } = await Promise.resolve().then(() => (init_supabase2(), supabase_exports));
  const selectedStats = expandStats(query.categories, query.stats);
  const live = await queryPlayersFromDb2(query, selectedStats, rosterState);
  if (live !== null) return live;
  const fromFile = await queryPlayersFromFile2(query, selectedStats);
  if (fromFile !== null) return fromFile;
  return queryPlayers(query, rosterState);
}
async function analysisSummaryAsync(query) {
  const players = await queryPlayersWithFallback(query, "waiver");
  const top = players[0];
  const hotPlayers = players.filter((p) => p.delta >= (query.playerType === "hitter" ? 0.05 : 0.5)).length;
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

// api/data/analysis.ts
async function handler(request = new Request("http://localhost/api/data/analysis")) {
  const query = parseDataQuery(request);
  return ok({
    status: "ok",
    ...await analysisSummaryAsync(query)
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
