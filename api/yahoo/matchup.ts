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

const STUB_MATCHUP = {
  opponent: "Midtown Mashers",
  scoringPeriod: "2025-W18",
  categories: [
    { category: "HR", myValue: 12, opponentValue: 14, result: "LOSS" },
    { category: "SB", myValue: 8, opponentValue: 6, result: "WIN" }
  ]
};

export async function handler(
  request: Request,
  env: Record<string, string | undefined> = process.env
): Promise<Response> {
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
      return new Response(
        JSON.stringify({ status: "ok", leagueId, ...STUB_MATCHUP }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": setCookieHeader(encrypted)
          }
        }
      );
    } catch {
      return json({ status: "unauthorized" }, { status: 401 });
    }
  }

  return json({ status: "ok", leagueId, ...STUB_MATCHUP });
}

export default handler;
