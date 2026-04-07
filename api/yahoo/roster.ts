import { json } from "../_shared/http.js";
import {
  encryptToken,
  isTokenExpired,
  parseCookieToken,
  readYahooEnv,
  setCookieHeader,
  toTokenRecord,
  type YahooOAuthExchangeResult
} from "../_shared/yahoo.js";

export const config = { runtime: "edge" };

export interface YahooPlayer {
  playerKey: string;
  playerName: string;
  team: string;
  teamFull: string;
  position: string;
  eligiblePositions: string[];
  selectedPosition: string;
  isStarting: boolean;
  status: string;
  statusFull: string;
  injuryNote: string;
  headshotUrl: string;
  stats: Record<string, string>;
}

// Standard Yahoo Fantasy MLB stat IDs (stable across seasons)
const MLB_STAT_NAMES: Record<string, string> = {
  // Batting
  "7": "AB", "8": "R", "9": "H", "10": "HR", "11": "RBI",
  "12": "SB", "13": "CS", "16": "BB", "17": "SO",
  "60": "AVG", "61": "OBP", "62": "SLG", "63": "OPS",
  // Pitching
  "26": "IP", "28": "W", "29": "L", "32": "SV", "33": "HLD",
  "36": "K", "37": "BB_P", "38": "ER", "46": "ERA", "48": "WHIP", "50": "QS"
};

// --- Parsing ---

export function parseYahooRoster(data: unknown): YahooPlayer[] {
  try {
    const fc = (data as Record<string, unknown>)?.fantasy_content;
    const teamArr = ((fc as Record<string, unknown>)?.team as unknown[]);
    if (!Array.isArray(teamArr) || teamArr.length < 2) return [];

    const rosterObj = (teamArr[1] as Record<string, unknown>)?.roster;
    const playersObj = (rosterObj as Record<string, unknown>)?.players;
    if (!playersObj || typeof playersObj !== "object") return [];

    const count = Number((playersObj as Record<string, unknown>)?.count ?? 0);
    const results: YahooPlayer[] = [];

    for (let i = 0; i < count; i++) {
      const entry = (playersObj as Record<string, unknown>)[String(i)];
      const playerArr = (entry as Record<string, unknown>)?.player;
      if (!Array.isArray(playerArr) || playerArr.length < 2) continue;

      // playerArr[0] is an array of metadata objects
      const metaList = playerArr[0] as Record<string, unknown>[];
      if (!Array.isArray(metaList)) continue;

      let playerKey = "";
      let playerName = "";
      let team = "";
      let teamFull = "";
      let position = "";
      let status = "";
      let statusFull = "";
      let injuryNote = "";
      let headshotUrl = "";
      const eligiblePositions: string[] = [];

      for (const meta of metaList) {
        if (typeof meta.player_key === "string") playerKey = meta.player_key;
        if (meta.name && typeof (meta.name as Record<string, unknown>).full === "string") {
          playerName = (meta.name as Record<string, string>).full;
        }
        if (typeof meta.editorial_team_abbr === "string") team = meta.editorial_team_abbr;
        if (typeof meta.editorial_team_full_name === "string") teamFull = meta.editorial_team_full_name;
        if (typeof meta.display_position === "string") position = meta.display_position;
        if (typeof meta.status === "string") status = meta.status;
        if (typeof meta.status_full === "string") statusFull = meta.status_full;
        if (typeof meta.injury_note === "string") injuryNote = meta.injury_note;
        if (meta.headshot && typeof (meta.headshot as Record<string, unknown>).url === "string") {
          headshotUrl = (meta.headshot as Record<string, string>).url;
        }
        if (meta.eligible_positions && Array.isArray(meta.eligible_positions)) {
          for (const ep of meta.eligible_positions as Record<string, unknown>[]) {
            if (typeof ep.position === "string") eligiblePositions.push(ep.position);
          }
        }
      }

      // playerArr[1] has selected_position, is_starting, and player_stats
      const playerData = playerArr[1] as Record<string, unknown>;

      const selPosArr = playerData?.selected_position as Record<string, unknown>[];
      let selectedPosition = "";
      let isStarting = false;
      if (Array.isArray(selPosArr)) {
        for (const sp of selPosArr) {
          if (typeof sp.position === "string") selectedPosition = sp.position;
          if (sp.is_starting === 1 || sp.is_starting === "1") isStarting = true;
        }
      }

      // Parse season stats if present (from /roster/players/stats endpoint)
      const stats: Record<string, string> = {};
      const playerStats = (playerData?.player_stats as Record<string, unknown>);
      if (playerStats) {
        const statList = playerStats.stats as Record<string, unknown>[];
        if (Array.isArray(statList)) {
          for (const item of statList) {
            const s = item.stat as Record<string, string>;
            if (s && s.stat_id && s.value !== undefined && s.value !== "-") {
              const name = MLB_STAT_NAMES[s.stat_id];
              if (name) stats[name] = s.value;
            }
          }
        }
      }

      if (!playerName) continue;
      results.push({
        playerKey, playerName, team, teamFull, position, eligiblePositions,
        selectedPosition, isStarting, status, statusFull, injuryNote, headshotUrl, stats
      });
    }

    return results;
  } catch {
    return [];
  }
}

// Parses response from GET /fantasy/v2/league/mlb.l.{id}/teams;use_login=1
function parseTeamKey(data: unknown): string | null {
  try {
    const fc = (data as Record<string, unknown>)?.fantasy_content;
    // Response root is fantasy_content.league (array)
    const leagueArr = (fc as Record<string, unknown>)?.league;
    if (!Array.isArray(leagueArr) || leagueArr.length < 2) return null;

    const teamsObj = (leagueArr[1] as Record<string, unknown>)?.teams;
    if (!teamsObj || typeof teamsObj !== "object") return null;

    const count = Number((teamsObj as Record<string, unknown>)?.count ?? 0);
    for (let i = 0; i < count; i++) {
      const entry = (teamsObj as Record<string, unknown>)[String(i)];
      const teamArr = (entry as Record<string, unknown>)?.team;
      if (!Array.isArray(teamArr) || teamArr.length === 0) continue;

      const metaList = teamArr[0] as Record<string, unknown>[];
      if (!Array.isArray(metaList)) continue;

      for (const meta of metaList) {
        if (typeof meta.team_key === "string") return meta.team_key;
      }
    }
    return null;
  } catch {
    return null;
  }
}

// --- API helpers ---

async function fetchUserTeamKey(
  accessToken: string,
  yahooLeagueId: string
): Promise<string | null> {
  const leagueKey = `mlb.l.${yahooLeagueId}`;
  // Simple direct URL: league → teams filtered to current user's team
  const url = `https://fantasysports.yahooapis.com/fantasy/v2/league/${leagueKey}/teams;use_login=1?format=json`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!response.ok) throw new Error(`Yahoo team fetch failed: ${response.status}`);
  const data = await response.json();
  return parseTeamKey(data);
}

function parsePlayerStats(data: unknown): Record<string, Record<string, string>> {
  // Returns map of playerKey → { statName: value }
  const result: Record<string, Record<string, string>> = {};
  try {
    const fc = (data as Record<string, unknown>)?.fantasy_content;
    const players = (fc as Record<string, unknown>)?.players;
    if (!players || typeof players !== "object") return result;

    const count = Number((players as Record<string, unknown>)?.count ?? 0);
    for (let i = 0; i < count; i++) {
      const entry = (players as Record<string, unknown>)[String(i)];
      const playerArr = (entry as Record<string, unknown>)?.player;
      if (!Array.isArray(playerArr) || playerArr.length < 2) continue;

      const metaList = playerArr[0] as Record<string, unknown>[];
      let playerKey = "";
      if (Array.isArray(metaList)) {
        for (const meta of metaList) {
          if (typeof meta.player_key === "string") { playerKey = meta.player_key; break; }
        }
      }
      if (!playerKey) continue;

      const playerData = playerArr[1] as Record<string, unknown>;
      const playerStats = playerData?.player_stats as Record<string, unknown>;
      const statList = playerStats?.stats as Record<string, unknown>[];
      if (!Array.isArray(statList)) continue;

      const stats: Record<string, string> = {};
      for (const item of statList) {
        const s = item.stat as Record<string, string>;
        if (s?.stat_id && s.value !== undefined && s.value !== "-") {
          const name = MLB_STAT_NAMES[s.stat_id];
          if (name) stats[name] = s.value;
        }
      }
      result[playerKey] = stats;
    }
  } catch { /* return partial result */ }
  return result;
}

async function fetchStats(
  accessToken: string,
  players: YahooPlayer[]
): Promise<YahooPlayer[]> {
  if (players.length === 0) return players;
  const season = new Date().getFullYear();
  const keys = players.map((p) => p.playerKey).filter(Boolean).join(",");
  const statsUrl = `https://fantasysports.yahooapis.com/fantasy/v2/players;player_keys=${keys}/stats;type=season;season=${season}?format=json`;
  try {
    const statsResp = await fetch(statsUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (statsResp.ok) {
      const statsData = await statsResp.json();
      const statsMap = parsePlayerStats(statsData);
      return players.map((p) => ({ ...p, stats: statsMap[p.playerKey] ?? {} }));
    }
  } catch { /* non-fatal */ }
  return players;
}

async function refreshYahooToken(
  refreshToken: string,
  env: Record<string, string | undefined>
): Promise<YahooOAuthExchangeResult> {
  const cfg = readYahooEnv(env);
  const credentials = btoa(`${cfg.clientId}:${cfg.clientSecret}`);
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken
  });
  const response = await fetch("https://api.login.yahoo.com/oauth2/get_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: body.toString()
  });
  if (!response.ok) throw new Error("refresh_failed");
  const data = (await response.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in
  };
}

async function buildRosterResponse(
  accessToken: string,
  leagueId: string,
  extraHeaders?: Record<string, string>
): Promise<Response> {
  const leagueKey = `mlb.l.${leagueId}`;
  const teamUrl = `https://fantasysports.yahooapis.com/fantasy/v2/league/${leagueKey}/teams;use_login=1?format=json`;
  const teamResp = await fetch(teamUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
  const teamRaw = await teamResp.json();
  console.log("[debug] teamUrl status:", teamResp.status);
  console.log("[debug] teamRaw:", JSON.stringify(teamRaw));

  const teamKey = parseTeamKey(teamRaw);
  console.log("[debug] teamKeyExtracted:", teamKey);

  if (!teamKey) {
    return json({ status: "no_team", debug: { teamStatus: teamResp.status, teamRaw } }, { status: 404 });
  }

  const rosterUrl = `https://fantasysports.yahooapis.com/fantasy/v2/team/${teamKey}/roster?format=json`;
  const rosterResp = await fetch(rosterUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
  const rosterRaw = await rosterResp.json();
  console.log("[debug] rosterUrl status:", rosterResp.status);
  console.log("[debug] rosterRaw:", JSON.stringify(rosterRaw));

  const players = parseYahooRoster(rosterRaw);
  console.log("[debug] parsedPlayers count:", players.length);

  // Fetch season stats and merge
  const withStats = await fetchStats(accessToken, players);
  const body = JSON.stringify({ status: "ok", leagueId, roster: withStats });
  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "application/json", ...extraHeaders }
  });
}

export async function handler(request: Request): Promise<Response> {
  const env = process.env as Record<string, string | undefined>;
  const url = new URL(request.url);
  const leagueId = url.searchParams.get("league_id");

  if (!leagueId) {
    return json({ status: "missing_league_id" }, { status: 400 });
  }

  const cookieSecret = env.COOKIE_SECRET ?? "";
  let token = await parseCookieToken(request.headers.get("Cookie"), cookieSecret);
  if (!token) {
    return json({ status: "unauthorized" }, { status: 401 });
  }

  if (isTokenExpired(token)) {
    try {
      const refreshed = await refreshYahooToken(token.refreshToken, env);
      token = toTokenRecord(refreshed);
      const encrypted = await encryptToken(token, cookieSecret);
      return buildRosterResponse(token.accessToken, leagueId, {
        "Set-Cookie": setCookieHeader(encrypted)
      });
    } catch {
      return json({ status: "unauthorized" }, { status: 401 });
    }
  }

  try {
    return buildRosterResponse(token.accessToken, leagueId);
  } catch {
    return json({ status: "fetch_failed" }, { status: 502 });
  }
}

export default handler;
