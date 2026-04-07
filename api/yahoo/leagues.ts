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

export interface LeagueResult {
  id: string;
  name: string;
  yahooLeagueId: string;
  season: number;
}

function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

export function parseYahooLeagues(data: unknown): LeagueResult[] {
  try {
    const fc = (data as Record<string, unknown>)?.fantasy_content;
    const users = (fc as Record<string, unknown>)?.users;
    const userEntry = ((users as Record<string, unknown>)?.["0"] as Record<string, unknown>)?.user;
    if (!Array.isArray(userEntry) || userEntry.length < 2) return [];

    const games = (userEntry[1] as Record<string, unknown>)?.games;
    const gameEntry = ((games as Record<string, unknown>)?.["0"] as Record<string, unknown>)?.game;
    if (!Array.isArray(gameEntry) || gameEntry.length < 2) return [];

    const leaguesObj = (gameEntry[1] as Record<string, unknown>)?.leagues;
    if (!leaguesObj || typeof leaguesObj !== "object") return [];

    const count = Number((leaguesObj as Record<string, unknown>)?.count ?? 0);
    const results: LeagueResult[] = [];

    for (let i = 0; i < count; i++) {
      const entry = (leaguesObj as Record<string, unknown>)[String(i)];
      const leagueArr = (entry as Record<string, unknown>)?.league;
      if (!Array.isArray(leagueArr) || leagueArr.length === 0) continue;

      const meta = leagueArr[0] as Record<string, string>;
      if (!meta.league_id || !meta.name) continue;

      results.push({
        id: slugify(meta.name),
        name: meta.name,
        yahooLeagueId: meta.league_id,
        season: parseInt(meta.season ?? String(new Date().getFullYear()), 10)
      });
    }

    return results;
  } catch {
    return [];
  }
}

async function refreshYahooToken(
  refreshToken: string,
  env: Record<string, string | undefined>
): Promise<YahooOAuthExchangeResult> {
  const config = readYahooEnv(env);
  const credentials = btoa(`${config.clientId}:${config.clientSecret}`);
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

async function fetchYahooLeagues(accessToken: string): Promise<LeagueResult[]> {
  const url =
    "https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_keys=mlb/leagues?format=json";
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!response.ok) throw new Error(`Yahoo leagues fetch failed: ${response.status}`);
  const data = await response.json();
  return parseYahooLeagues(data);
}

export async function handler(
  request: Request,
  env: Record<string, string | undefined> = process.env
): Promise<Response> {
  const cookieSecret = env.COOKIE_SECRET ?? "";
  let token = await parseCookieToken(request.headers.get("Cookie"), cookieSecret);
  if (!token) {
    return json({ status: "unauthorized" }, { status: 401 });
  }

  if (isTokenExpired(token)) {
    let refreshedToken: typeof token;
    let encrypted: string;
    try {
      const refreshed = await refreshYahooToken(token.refreshToken, env);
      refreshedToken = toTokenRecord(refreshed);
      encrypted = await encryptToken(refreshedToken, cookieSecret);
    } catch {
      return json({ status: "unauthorized" }, { status: 401 });
    }
    try {
      const leagues = await fetchYahooLeagues(refreshedToken.accessToken);
      return new Response(JSON.stringify({ status: "ok", leagues }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": setCookieHeader(encrypted)
        }
      });
    } catch {
      return json({ status: "fetch_failed" }, { status: 502 });
    }
  }

  try {
    const leagues = await fetchYahooLeagues(token.accessToken);
    return json({ status: "ok", leagues });
  } catch {
    return json({ status: "fetch_failed" }, { status: 502 });
  }
}

export default handler;
