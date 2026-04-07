import { analysisSummaryAsync, ok, parseDataQuery } from "../_shared/data.js";

export const config = { runtime: "edge" };

export async function handler(request: Request = new Request("http://localhost/api/data/analysis")) {
  const query = parseDataQuery(request);
  return ok({
    status: "ok",
    ...(await analysisSummaryAsync(query))
  });
}

export default handler;
