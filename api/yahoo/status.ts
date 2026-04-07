export const config = { runtime: "edge" };

import { json } from "../_shared/http.js";
import { parseCookieToken } from "../_shared/yahoo.js";

export async function handler(
  request: Request,
  env: Record<string, string | undefined> = process.env
): Promise<Response> {
  const cookieSecret = env.COOKIE_SECRET ?? "";
  const cookieHeader = request.headers.get("Cookie");
  const token = await parseCookieToken(cookieHeader, cookieSecret);
  return json({ connected: token !== null });
}

export default handler;
