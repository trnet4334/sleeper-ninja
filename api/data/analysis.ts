import { analysisSummaryAsync, ok, parseDataQuery } from "../_shared/data";

export async function handler(request: Request = new Request("http://localhost/api/data/analysis")) {
  const query = parseDataQuery(request);
  return ok({
    status: "ok",
    ...(await analysisSummaryAsync(query))
  });
}
