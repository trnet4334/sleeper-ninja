import { json } from "../_shared/http.js";
import {
  clearCookieHeader,
  encryptToken,
  hasYahooConfig,
  parseCookieToken,
  readYahooEnv,
  setCookieHeader,
  toTokenRecord,
  type YahooOAuthExchangeResult
} from "../_shared/yahoo.js";

export const config = { runtime: "edge" };

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

  if (!response.ok) {
    throw new Error(`Yahoo token refresh failed: ${response.status}`);
  }

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

export async function handler(
  request: Request
): Promise<Response> {
  const env = process.env as Record<string, string | undefined>;
  if (!hasYahooConfig(env)) {
    return json({ status: "missing_config" }, { status: 500 });
  }

  const cookieSecret = env.COOKIE_SECRET;
  if (!cookieSecret) {
    return json({ status: "missing_cookie_secret" }, { status: 500 });
  }

  const token = await parseCookieToken(request.headers.get("Cookie"), cookieSecret);
  if (!token) {
    return json({ status: "unauthorized" }, { status: 401 });
  }

  try {
    const refreshed = await refreshYahooToken(token.refreshToken, env);
    const record = toTokenRecord(refreshed);
    const encrypted = await encryptToken(record, cookieSecret);
    return json(
      { status: "refreshed" },
      { headers: { "Set-Cookie": setCookieHeader(encrypted) } }
    );
  } catch {
    return new Response(JSON.stringify({ status: "unauthorized" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": clearCookieHeader()
      }
    });
  }
}

export default handler;
