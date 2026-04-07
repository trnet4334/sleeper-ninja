import { matchupSummaryAsync, ok, parseDataQuery } from "../_shared/data.js";

export const config = { runtime: "edge" };

export async function handler(request: Request = new Request("http://localhost/api/data/matchup")) {
  const query = parseDataQuery(request);
  return ok({
    status: "ok",
    ...(await matchupSummaryAsync(query))
  });
}

export default handler;
