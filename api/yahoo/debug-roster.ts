// TEMPORARY DEBUG ENDPOINT — remove after diagnosing roster issue
import { json } from "../_shared/http.js";
import { isTokenExpired, parseCookieToken } from "../_shared/yahoo.js";

export const config = { runtime: "edge" };

export async function handler(request: Request): Promise<Response> {
  const env = process.env as Record<string, string | undefined>;
  const url = new URL(request.url);
  const leagueId = url.searchParams.get("league_id");

  if (!leagueId) return json({ error: "missing league_id" }, { status: 400 });

  const cookieSecret = env.COOKIE_SECRET ?? "";
  const token = await parseCookieToken(request.headers.get("Cookie"), cookieSecret);
  if (!token) return json({ error: "unauthorized" }, { status: 401 });
  if (isTokenExpired(token)) return json({ error: "token_expired" }, { status: 401 });

  const leagueKey = `mlb.l.${leagueId}`;
  const headers = { Authorization: `Bearer ${token.accessToken}` };

  // Call 1: find user's team in the league
  const teamUrl = `https://fantasysports.yahooapis.com/fantasy/v2/league/${leagueKey}/teams;use_login=1?format=json`;
  const teamResp = await fetch(teamUrl, { headers });
  const teamRaw = await teamResp.json();

  // Try to extract team key from the response
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

  return json({
    leagueKey,
    teamUrl,
    teamStatus: teamResp.status,
    teamRaw,
    teamKeyExtracted: teamKey,
    rosterRaw
  });
}

export default handler;
