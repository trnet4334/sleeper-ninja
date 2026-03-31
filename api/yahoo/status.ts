import { json } from "../_shared/http";
import { parseCookieToken } from "../_shared/yahoo";

export async function handler(
  request: Request,
  env: Record<string, string | undefined> = process.env
): Promise<Response> {
  const cookieSecret = env.COOKIE_SECRET ?? "";
  const cookieHeader = request.headers.get("Cookie");
  const token = await parseCookieToken(cookieHeader, cookieSecret);
  return json({ connected: token !== null });
}
