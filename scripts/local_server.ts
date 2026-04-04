/**
 * Minimal local dev API server — replaces `vercel dev` without requiring Vercel auth.
 * Run: npx tsx scripts/local_server.ts
 * Serves /api/* routes on port 3001.
 */
import { createServer } from "http";
import { handler as analysisHandler } from "../api/data/analysis";
import { handler as matchupHandler } from "../api/data/matchup";
import { handler as playersHandler } from "../api/data/players";

const PORT = 3001;

const ROUTES: Record<string, (req: Request) => Promise<Response>> = {
  "/api/data/analysis": analysisHandler,
  "/api/data/matchup": matchupHandler,
  "/api/data/players": playersHandler,
};

createServer(async (nodeReq, nodeRes) => {
  const url = `http://localhost:${PORT}${nodeReq.url}`;
  const pathname = new URL(url).pathname;

  // CORS for local Vite dev
  nodeRes.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  nodeRes.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  nodeRes.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (nodeReq.method === "OPTIONS") {
    nodeRes.writeHead(204);
    nodeRes.end();
    return;
  }

  const handler = ROUTES[pathname];
  if (!handler) {
    nodeRes.writeHead(404, { "Content-Type": "application/json" });
    nodeRes.end(JSON.stringify({ error: `No handler for ${pathname}` }));
    return;
  }

  try {
    const webReq = new Request(url, { method: nodeReq.method ?? "GET" });
    const response = await handler(webReq);
    const body = await response.text();
    nodeRes.writeHead(response.status, { "Content-Type": "application/json" });
    nodeRes.end(body);
  } catch (err) {
    console.error(`[${pathname}]`, err);
    nodeRes.writeHead(500, { "Content-Type": "application/json" });
    nodeRes.end(JSON.stringify({ error: String(err) }));
  }
}).listen(PORT, () => {
  console.log(`Local API server running on http://localhost:${PORT}`);
  console.log("Routes:", Object.keys(ROUTES).join(", "));
});
