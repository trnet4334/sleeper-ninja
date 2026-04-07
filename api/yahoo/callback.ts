import { json } from "../_shared/http.js";
import {
  encryptToken,
  hasYahooConfig,
  readYahooEnv,
  setCookieHeader,
  toTokenRecord,
  type YahooOAuthExchangeResult
} from "../_shared/yahoo.js";

export const config = { runtime: "edge" };

async function exchangeCode(
  code: string,
  env: Record<string, string | undefined>
): Promise<YahooOAuthExchangeResult> {
  const config = readYahooEnv(env);
  const callbackUrl = `${config.baseUrl}/api/yahoo/callback`;
  const credentials = btoa(`${config.clientId}:${config.clientSecret}`);

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: callbackUrl
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
    throw new Error(`Yahoo token exchange failed: ${response.status}`);
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

  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return json({ status: "missing_code" }, { status: 400 });
  }

  const cookieSecret = env.COOKIE_SECRET;
  if (!cookieSecret) {
    return json({ status: "missing_cookie_secret" }, { status: 500 });
  }

  try {
    const tokenResult = await exchangeCode(code, env);
    const record = toTokenRecord(tokenResult);
    const encrypted = await encryptToken(record, cookieSecret);

    const config = readYahooEnv(env);
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${config.baseUrl}/?connected=true`,
        "Set-Cookie": setCookieHeader(encrypted)
      }
    });
  } catch {
    return json({ status: "exchange_failed" }, { status: 502 });
  }
}

export default handler;
