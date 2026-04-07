import { clearCookieHeader } from "../_shared/yahoo.js";

export const config = { runtime: "edge" };

export function handler(): Response {
  return new Response(JSON.stringify({ status: "disconnected" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": clearCookieHeader()
    }
  });
}

export default handler;
