import { json } from "../_shared/http.js";
import { buildYahooAuthUrl, hasYahooConfig } from "../_shared/yahoo.js";

export const config = { runtime: "edge" };

export function handler(
  request: Request = new Request("http://localhost/api/yahoo/connect")
): Response {
  const env = process.env as Record<string, string | undefined>;
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
