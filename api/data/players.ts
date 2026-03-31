import { ok, parseDataQuery, queryPlayersWithFallback } from "../_shared/data";

export async function handler(request: Request = new Request("http://localhost/api/data/players")) {
  const query = parseDataQuery(request);
  const players = await queryPlayersWithFallback(query);

  return ok({
    status: "ok",
    leagueId: query.leagueId,
    playerType: query.playerType,
    categories: query.categories,
    stats: query.stats,
    daysBack: query.daysBack,
    players
  });
}
