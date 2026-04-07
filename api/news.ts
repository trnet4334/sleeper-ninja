export const config = { runtime: "edge" };

import { createClient } from "@supabase/supabase-js";
import { json } from "./_shared/http.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NewsItem {
  id: string;
  source: "rotowire" | "mlb_api";
  playerName: string;
  team: string;
  category: "recalled" | "promoted" | "optioned" | "debut" | "other";
  title: string;
  summary: string;
  publishedAt: string;
  link?: string;
}

interface InjuryItem {
  id: string;
  source: "rotowire" | "mlb_api";
  playerName: string;
  team: string;
  position?: string;
  ilStatus: "IL10" | "IL15" | "IL60" | "DTD" | "RTN";
  description: string;
  returnDate?: string;
  publishedAt: string;
  link?: string;
}

interface NewsApiResponse<T> {
  items: T[];
  updatedAt: string | null;
  source: ("rotowire" | "mlb_api")[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function deriveCategoryTag(categories: string[]): NewsItem["category"] {
  if (categories.includes("debut")) return "debut";
  if (categories.includes("recalled")) return "recalled";
  if (categories.includes("promoted")) return "promoted";
  if (categories.includes("optioned")) return "optioned";
  return "other";
}

function deriveILStatus(typeDesc: string, categories: string[]): InjuryItem["ilStatus"] {
  if (categories.includes("return")) return "RTN";
  const desc = typeDesc.toLowerCase();
  if (desc.includes("60-day") || desc.includes("60 day")) return "IL60";
  if (desc.includes("15-day") || desc.includes("15 day")) return "IL15";
  if (desc.includes("10-day") || desc.includes("10 day")) return "IL10";
  if (desc.includes("day-to-day") || desc.includes("day to day")) return "DTD";
  return "IL10";
}

function serverSupabase() {
  const url = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_KEY ?? "";
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

// ---------------------------------------------------------------------------
// Supabase queries
// ---------------------------------------------------------------------------

function deriveCategoryFromTypeCode(typeCode: string, typeDesc: string): NewsItem["category"] {
  const code = typeCode.toUpperCase();
  const desc = typeDesc.toLowerCase();
  if (code === "RECALL" || desc.includes("recalled")) return "recalled";
  if (code === "OPTION" || desc.includes("optioned")) return "optioned";
  if (desc.includes("debut") || desc.includes("first")) return "debut";
  if (desc.includes("promot")) return "promoted";
  return "other";
}

async function fetchProspectsFromDb(
  days: number,
  cats: string[]
): Promise<NewsItem[] | null> {
  const supabase = serverSupabase();
  if (!supabase) return null;

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const sinceDateOnly = since.slice(0, 10);
  const prospectCats = cats.length > 0 ? cats : ["prospect", "recalled", "promoted", "optioned", "debut"];

  // Query Rotowire RSS news
  const { data: newsData, error: newsError } = await supabase
    .from("player_news")
    .select("*")
    .gte("published_at", since)
    .overlaps("categories", prospectCats)
    .order("published_at", { ascending: false });

  // Query MLB Transactions (recalls, options, DFAs)
  const { data: txnData, error: txnError } = await supabase
    .from("player_transactions")
    .select("*")
    .gte("date", sinceDateOnly)
    .overlaps("categories", ["prospect"])
    .order("date", { ascending: false });

  if (newsError && txnError) return null;

  const fromNews: NewsItem[] = (newsData ?? []).map((row: Record<string, unknown>) => ({
    id: `news-${String(row.id ?? "")}`,
    source: (row.source ?? "rotowire") as NewsItem["source"],
    playerName: String(row.player_name ?? ""),
    team: String(row.team ?? ""),
    category: deriveCategoryTag((row.categories as string[]) ?? []),
    title: String(row.title ?? ""),
    summary: String(row.summary ?? ""),
    publishedAt: String(row.published_at ?? ""),
    link: row.link ? String(row.link) : undefined,
  }));

  const fromTxn: NewsItem[] = (txnData ?? []).map((row: Record<string, unknown>) => ({
    id: `txn-${String(row.id ?? "")}`,
    source: "mlb_api" as NewsItem["source"],
    playerName: String(row.player_name ?? ""),
    team: String(row.team ?? ""),
    category: deriveCategoryFromTypeCode(String(row.type_code ?? ""), String(row.type_desc ?? "")),
    title: String(row.type_desc ?? ""),
    summary: String(row.description ?? ""),
    publishedAt: String(row.date ?? ""),
    link: undefined,
  }));

  return [...fromNews, ...fromTxn].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt)
  );
}

async function fetchInjuriesFromDb(
  days: number,
  statuses: string[]
): Promise<InjuryItem[] | null> {
  const supabase = serverSupabase();
  if (!supabase) return null;

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const injuryCats = statuses.length > 0 ? statuses : ["injury", "return"];

  const { data, error } = await supabase
    .from("player_transactions")
    .select("*")
    .gte("date", since)
    .overlaps("categories", injuryCats)
    .order("date", { ascending: false });

  if (error || !data) return null;

  return data.map((row: Record<string, unknown>) => ({
    id: String(row.id ?? ""),
    source: (row.source ?? "mlb_api") as InjuryItem["source"],
    playerName: String(row.player_name ?? ""),
    team: String(row.team ?? ""),
    position: row.position ? String(row.position) : undefined,
    ilStatus: deriveILStatus(
      String(row.type_desc ?? ""),
      (row.categories as string[]) ?? []
    ),
    description: String(row.description ?? ""),
    returnDate: row.resolution_date ? String(row.resolution_date) : undefined,
    publishedAt: String(row.date ?? ""),
    link: undefined,
  }));
}

// ---------------------------------------------------------------------------
// Local JSON fallback
// ---------------------------------------------------------------------------

async function fetchProspectsFromFile(days: number): Promise<NewsItem[] | null> {
  const baseUrl =
    typeof window !== "undefined" ? "" : "http://localhost:3001";
  const since = Date.now() - days * 24 * 60 * 60 * 1000;
  const sinceDateOnly = new Date(since).toISOString().slice(0, 10);
  const prospectCats = ["prospect", "recalled", "promoted", "optioned", "debut"];

  let fromNews: NewsItem[] = [];
  let fromTxn: NewsItem[] = [];

  try {
    const res = await fetch(`${baseUrl}/exports/player_news.json`);
    if (res.ok) {
      const rows = (await res.json()) as Record<string, unknown>[];
      fromNews = rows
        .filter((r) => {
          const cats = (r.categories as string[]) ?? [];
          const pub = new Date(String(r.published_at ?? "")).getTime();
          return cats.some((c) => prospectCats.includes(c)) && pub >= since;
        })
        .map((row) => ({
          id: `news-${String(row.id ?? "")}`,
          source: (row.source ?? "rotowire") as NewsItem["source"],
          playerName: String(row.player_name ?? ""),
          team: String(row.team ?? ""),
          category: deriveCategoryTag((row.categories as string[]) ?? []),
          title: String(row.title ?? ""),
          summary: String(row.summary ?? ""),
          publishedAt: String(row.published_at ?? ""),
          link: row.link ? String(row.link) : undefined,
        }));
    }
  } catch { /* ignore */ }

  try {
    const res = await fetch(`${baseUrl}/exports/player_transactions.json`);
    if (res.ok) {
      const rows = (await res.json()) as Record<string, unknown>[];
      fromTxn = rows
        .filter((r) => {
          const cats = (r.categories as string[]) ?? [];
          return cats.includes("prospect") && String(r.date ?? "") >= sinceDateOnly;
        })
        .map((row) => ({
          id: `txn-${String(row.id ?? "")}`,
          source: "mlb_api" as NewsItem["source"],
          playerName: String(row.player_name ?? ""),
          team: String(row.team ?? ""),
          category: deriveCategoryFromTypeCode(String(row.type_code ?? ""), String(row.type_desc ?? "")),
          title: String(row.type_desc ?? ""),
          summary: String(row.description ?? ""),
          publishedAt: String(row.date ?? ""),
          link: undefined,
        }));
    }
  } catch { /* ignore */ }

  if (fromNews.length === 0 && fromTxn.length === 0) return null;
  return [...fromNews, ...fromTxn].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt)
  );
}

async function fetchInjuriesFromFile(days: number): Promise<InjuryItem[] | null> {
  try {
    const baseUrl =
      typeof window !== "undefined" ? "" : "http://localhost:3001";
    const res = await fetch(`${baseUrl}/exports/player_transactions.json`);
    if (!res.ok) return null;
    const rows = (await res.json()) as Record<string, unknown>[];
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    return rows
      .filter((r) => {
        const cats = (r.categories as string[]) ?? [];
        return (
          (cats.includes("injury") || cats.includes("return")) &&
          String(r.date ?? "") >= since
        );
      })
      .sort((a, b) =>
        String(b.date ?? "").localeCompare(String(a.date ?? ""))
      )
      .map((row) => ({
        id: String(row.id ?? ""),
        source: (row.source ?? "mlb_api") as InjuryItem["source"],
        playerName: String(row.player_name ?? ""),
        team: String(row.team ?? ""),
        ilStatus: deriveILStatus(
          String(row.type_desc ?? ""),
          (row.categories as string[]) ?? []
        ),
        description: String(row.description ?? ""),
        returnDate: row.resolution_date ? String(row.resolution_date) : undefined,
        publishedAt: String(row.date ?? ""),
      }));
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function handler(
  request: Request = new Request("http://localhost/api/news")
) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const days = Number(url.searchParams.get("days") ?? (type === "injuries" ? 14 : 7));
  const catsParam = url.searchParams.get("cats") ?? "";
  const cats = catsParam.split(",").map((c) => c.trim()).filter(Boolean);

  if (type !== "prospects" && type !== "injuries") {
    return json(
      { error: "type must be prospects or injuries" },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  if (type === "prospects") {
    const fromDb = await fetchProspectsFromDb(days, cats);
    if (fromDb !== null) {
      return json<NewsApiResponse<NewsItem>>({
        items: fromDb,
        updatedAt: now,
        source: ["rotowire", "mlb_api"],
      });
    }
    const fromFile = await fetchProspectsFromFile(days);
    return json<NewsApiResponse<NewsItem>>({
      items: fromFile ?? [],
      updatedAt: fromFile ? now : null,
      source: fromFile ? ["rotowire", "mlb_api"] : [],
    });
  }

  // type === "injuries"
  const fromDb = await fetchInjuriesFromDb(days, cats);
  if (fromDb !== null) {
    return json<NewsApiResponse<InjuryItem>>({
      items: fromDb,
      updatedAt: now,
      source: ["mlb_api"],
    });
  }
  const fromFile = await fetchInjuriesFromFile(days);
  return json<NewsApiResponse<InjuryItem>>({
    items: fromFile ?? [],
    updatedAt: fromFile ? now : null,
    source: fromFile ? ["mlb_api"] : [],
  });
}

export default handler;
