import { json } from "../_shared/http.js";
import { parseCookieToken } from "../_shared/yahoo.js";

export const config = { runtime: "edge" };

export async function handler(
  request: Request
): Promise<Response> {
  const env = process.env as Record<string, string | undefined>;
  const cookieSecret = env.COOKIE_SECRET ?? "";
  const cookieHeader = request.headers.get("Cookie");
  const token = await parseCookieToken(cookieHeader, cookieSecret);
  return json({ connected: token !== null });
}

export default handler;
