export const config = { runtime: "edge" };

import { json } from "../_shared/http.js";
import { buildYahooAuthUrl, hasYahooConfig } from "../_shared/yahoo.js";

export function handler(
  request: Request = new Request("http://localhost/api/yahoo/connect"),
  env: Record<string, string | undefined> = process.env
): Response {
  void request;
  if (!hasYahooConfig(env)) {
    return json({ status: "missing_config" }, { status: 500 });
  }

  const authUrl = buildYahooAuthUrl(env);
  return new Response(null, {
    status: 302,
    headers: { Location: authUrl }
  });
}

export default handler;
