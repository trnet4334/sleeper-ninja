// TEMPORARY DEBUG ENDPOINT — remove after diagnosing roster issue
import { json } from "../_shared/http.js";
import {
  encryptToken,
  isTokenExpired,
  parseCookieToken,
  readYahooEnv,
  setCookieHeader,
  toTokenRecord
} from "../_shared/yahoo.js";

export const config = { runtime: "edge" };

export async function handler(request: Request): Promise<Response> {
  const env = process.env as Record<string, string | undefined>;
  const url = new URL(request.url);
  const leagueId = url.searchParams.get("league_id");

  if (!leagueId) return json({ error: "missing league_id" }, { status: 400 });

  const cookieSecret = env.COOKIE_SECRET ?? "";
  let token = await parseCookieToken(request.headers.get("Cookie"), cookieSecret);
  if (!token) return json({ error: "no_cookie — make sure you are logged in via /api/yahoo/connect" }, { status: 401 });

  // Refresh if expired
  let refreshedCookie: string | undefined;
  if (isTokenExpired(token)) {
    try {
      const cfg = readYahooEnv(env);
      const credentials = btoa(`${cfg.clientId}:${cfg.clientSecret}`);
      const refreshResp = await fetch("https://api.login.yahoo.com/oauth2/get_token", {
        method: "POST",
        headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: token.refreshToken }).toString()
      });
      if (!refreshResp.ok) return json({ error: "token_expired_and_refresh_failed", status: refreshResp.status }, { status: 401 });
      const refreshData = (await refreshResp.json()) as { access_token: string; refresh_token: string; expires_in: number };
      token = toTokenRecord({ accessToken: refreshData.access_token, refreshToken: refreshData.refresh_token, expiresIn: refreshData.expires_in });
      const encrypted = await encryptToken(token, cookieSecret);
      refreshedCookie = setCookieHeader(encrypted);
    } catch (e) {
      return json({ error: "refresh_exception", detail: String(e) }, { status: 401 });
    }
  }

  const leagueKey = `mlb.l.${leagueId}`;
  const headers = { Authorization: `Bearer ${token.accessToken}` };

  // Call 1: find user's team in the league
  const teamUrl = `https://fantasysports.yahooapis.com/fantasy/v2/league/${leagueKey}/teams;use_login=1?format=json`;
  const teamResp = await fetch(teamUrl, { headers });
  const teamRaw = await teamResp.json();

  // Try to extract team key
  let teamKey: string | null = null;
  try {
    const fc = (teamRaw as Record<string, unknown>)?.fantasy_content;
    const leagueArr = (fc as Record<string, unknown>)?.league;
    if (Array.isArray(leagueArr) && leagueArr.length >= 2) {
      const teamsObj = (leagueArr[1] as Record<string, unknown>)?.teams;
      const count = Number((teamsObj as Record<string, unknown>)?.count ?? 0);
      for (let i = 0; i < count; i++) {
        const entry = (teamsObj as Record<string, unknown>)[String(i)];
        const teamArr = (entry as Record<string, unknown>)?.team;
        if (Array.isArray(teamArr) && teamArr.length > 0) {
          const metaList = teamArr[0] as Record<string, unknown>[];
          if (Array.isArray(metaList)) {
            for (const meta of metaList) {
              if (typeof meta.team_key === "string") { teamKey = meta.team_key; break; }
            }
          }
        }
        if (teamKey) break;
      }
    }
  } catch { /* ignore */ }

  // Call 2: roster (only if we have a team key)
  let rosterRaw: unknown = null;
  if (teamKey) {
    const rosterUrl = `https://fantasysports.yahooapis.com/fantasy/v2/team/${teamKey}/roster?format=json`;
    const rosterResp = await fetch(rosterUrl, { headers });
    rosterRaw = await rosterResp.json();
  }

  const responseBody = JSON.stringify({
    tokenWasExpired: isTokenExpired(token),
    tokenRefreshed: !!refreshedCookie,
    leagueKey,
    teamUrl,
    teamStatus: teamResp.status,
    teamRaw,
    teamKeyExtracted: teamKey,
    rosterRaw
  });

  return new Response(responseBody, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ...(refreshedCookie ? { "Set-Cookie": refreshedCookie } : {})
    }
  });
}

export default handler;
