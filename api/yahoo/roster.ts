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
  playerName: string;
  team: string;
  position: string;
  selectedPosition: string;
  status: string;
}

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

      let playerName = "";
      let team = "";
      let position = "";
      let status = "";

      for (const meta of metaList) {
        if (meta.name && typeof (meta.name as Record<string, unknown>).full === "string") {
          playerName = (meta.name as Record<string, string>).full;
        }
        if (typeof meta.editorial_team_abbr === "string") {
          team = meta.editorial_team_abbr;
        }
        if (typeof meta.display_position === "string") {
          position = meta.display_position;
        }
        if (typeof meta.status === "string") {
          status = meta.status;
        }
      }

      // playerArr[1] has selected_position
      const playerData = playerArr[1] as Record<string, unknown>;
      const selPosObj = (playerData?.selected_position as Record<string, unknown>[]);
      let selectedPosition = "";
      if (Array.isArray(selPosObj)) {
        for (const sp of selPosObj) {
          if (typeof sp.position === "string") {
            selectedPosition = sp.position;
            break;
          }
        }
      }

      if (!playerName) continue;
      results.push({ playerName, team, position, selectedPosition, status });
    }

    return results;
  } catch {
    return [];
  }
}

function parseTeamKey(data: unknown): string | null {
  try {
    const fc = (data as Record<string, unknown>)?.fantasy_content;
    const users = (fc as Record<string, unknown>)?.users;
    const userEntry = ((users as Record<string, unknown>)?.["0"] as Record<string, unknown>)?.user;
    if (!Array.isArray(userEntry) || userEntry.length < 2) return null;

    const games = (userEntry[1] as Record<string, unknown>)?.games;
    const gameEntry = ((games as Record<string, unknown>)?.["0"] as Record<string, unknown>)?.game;
    if (!Array.isArray(gameEntry) || gameEntry.length < 2) return null;

    const leaguesObj = (gameEntry[1] as Record<string, unknown>)?.leagues;
    const leagueEntry = ((leaguesObj as Record<string, unknown>)?.["0"] as Record<string, unknown>)?.league;
    if (!Array.isArray(leagueEntry) || leagueEntry.length < 2) return null;

    const teamsObj = (leagueEntry[1] as Record<string, unknown>)?.teams;
    const count = Number((teamsObj as Record<string, unknown>)?.count ?? 0);

    for (let i = 0; i < count; i++) {
      const entry = (teamsObj as Record<string, unknown>)[String(i)];
      const teamArr = (entry as Record<string, unknown>)?.team;
      if (!Array.isArray(teamArr) || teamArr.length === 0) continue;

      const metaList = teamArr[0] as Record<string, unknown>[];
      if (!Array.isArray(metaList)) continue;

      // teams;use_login=1 already filters to the current user's teams,
      // so is_owned_by_current_login is not included — just return first key found.
      let teamKey = "";
      for (const meta of metaList) {
        if (typeof meta.team_key === "string") { teamKey = meta.team_key; break; }
      }
      if (teamKey) return teamKey;
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
  const url = `https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=mlb/leagues;league_keys=${leagueKey}/teams;use_login=1?format=json`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!response.ok) throw new Error(`Yahoo team fetch failed: ${response.status}`);
  const data = await response.json();
  return parseTeamKey(data);
}

async function fetchYahooRoster(
  accessToken: string,
  teamKey: string
): Promise<YahooPlayer[]> {
  const url = `https://fantasysports.yahooapis.com/fantasy/v2/team/${teamKey}/roster?format=json`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!response.ok) throw new Error(`Yahoo roster fetch failed: ${response.status}`);
  const data = await response.json();
  return parseYahooRoster(data);
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
  const teamKey = await fetchUserTeamKey(accessToken, leagueId);
  if (!teamKey) {
    return json({ status: "no_team" }, { status: 404 });
  }
  const roster = await fetchYahooRoster(accessToken, teamKey);
  const body = JSON.stringify({ status: "ok", leagueId, roster });
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
