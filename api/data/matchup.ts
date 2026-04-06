import { matchupSummaryAsync, ok, parseDataQuery } from "../_shared/data.js";

export async function handler(request: Request = new Request("http://localhost/api/data/matchup")) {
  const query = parseDataQuery(request);
  return ok({
    status: "ok",
    ...(await matchupSummaryAsync(query))
  });
}
