"""Fetch Rotowire RSS news and MLB Transactions, write to Supabase + local JSON exports.

Tables:
  player_news         — Rotowire RSS entries, deduplicated on (source, link)
  player_transactions — MLB Stats API transactions, deduplicated on (source, player_id, date, type_code)

Local exports:
  public/exports/player_news.json
  public/exports/player_transactions.json

SQL to create tables (run once in Supabase):

  CREATE TABLE player_news (
    id           BIGSERIAL PRIMARY KEY,
    source       TEXT NOT NULL,
    player_name  TEXT,
    title        TEXT NOT NULL,
    summary      TEXT,
    categories   TEXT[],
    published_at TEXT,
    link         TEXT,
    updated_at   TIMESTAMPTZ DEFAULT now(),
    UNIQUE(source, link)
  );
  CREATE INDEX idx_player_news_player     ON player_news(player_name);
  CREATE INDEX idx_player_news_categories ON player_news USING GIN(categories);
  CREATE INDEX idx_player_news_published  ON player_news(published_at DESC);

  CREATE TABLE player_transactions (
    id              BIGSERIAL PRIMARY KEY,
    source          TEXT DEFAULT 'mlb_api',
    player_name     TEXT,
    player_id       TEXT,
    team            TEXT,
    type_code       TEXT,
    type_desc       TEXT,
    description     TEXT,
    categories      TEXT[],
    date            DATE,
    resolution_date DATE,
    updated_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE(source, player_id, date, type_code)
  );
  CREATE INDEX idx_transactions_player     ON player_transactions(player_id);
  CREATE INDEX idx_transactions_date       ON player_transactions(date DESC);
  CREATE INDEX idx_transactions_categories ON player_transactions USING GIN(categories);
"""
from __future__ import annotations

from datetime import date, timedelta

from scripts.utils.db import write_rows

ROTOWIRE_RSS_URL = "https://www.rotowire.com/baseball/rss-news.xml"
MLB_TRANSACTIONS_URL = "https://statsapi.mlb.com/api/v1/transactions"

NEWS_CATEGORIES: dict[str, list[str]] = {
    "injury": [
        "il", "injured", "strain", "fracture", "surgery", "dtd",
        "inflammation", "soreness", "sprain", "tear",
    ],
    "return": ["reinstated", "activated", "returns", "cleared", "back in"],
    "prospect": ["recalled", "called up", "promoted", "optioned", "designated", "assigned", "debut"],
    "role": ["closer", "lineup", "batting order", "rotation", "setup"],
    "trade": ["traded", "acquired", "claimed", "dfa", "released"],
}


def _categorize(text: str) -> list[str]:
    lower = text.lower()
    return [cat for cat, keywords in NEWS_CATEGORIES.items() if any(kw in lower for kw in keywords)]


def fetch_rotowire_news() -> list[dict[str, object]]:
    """Fetch Rotowire RSS and parse into structured records."""
    try:
        import feedparser  # type: ignore[import-untyped]
        feed = feedparser.parse(
            ROTOWIRE_RSS_URL,
            request_headers={"User-Agent": "Mozilla/5.0 (compatible; SleepNinja/1.0; +https://github.com)"},
        )
        if feed.get("status", 200) not in (200, 301, 302):
            print(f"[news] rotowire HTTP {feed.get('status')} — skipping")
            return []
    except Exception as exc:
        print(f"[news] rotowire fetch error: {exc}")
        return []

    records: list[dict[str, object]] = []
    for entry in feed.entries:
        title: str = entry.get("title", "")
        summary: str = entry.get("summary", "")
        parts = title.split(":", 1)
        player_name = parts[0].strip() if len(parts) > 1 else ""
        categories = _categorize(f"{title} {summary}")
        records.append({
            "source": "rotowire",
            "player_name": player_name,
            "title": title,
            "summary": summary,
            "categories": categories,
            "published_at": entry.get("published", ""),
            "link": entry.get("link", ""),
        })
    return records


def fetch_mlb_transactions(days_back: int = 7) -> list[dict[str, object]]:
    """Fetch MLB Stats API transactions for the past `days_back` days."""
    try:
        import httpx
        end = date.today()
        start = end - timedelta(days=days_back)
        resp = httpx.get(
            MLB_TRANSACTIONS_URL,
            params={"startDate": str(start), "endDate": str(end), "sportId": 1},
            timeout=10,
        )
        resp.raise_for_status()
        raw = resp.json()
    except Exception as exc:
        print(f"[news] mlb transactions fetch error: {exc}")
        return []

    records: list[dict[str, object]] = []
    for t in raw.get("transactions", []):
        type_desc: str = t.get("typeDesc", "")
        type_code: str = t.get("typeCode", "")
        description: str = t.get("description", "")
        categories = _categorize(f"{type_desc} {description}")
        records.append({
            "source": "mlb_api",
            "player_name": t.get("person", {}).get("fullName", ""),
            "player_id": str(t.get("person", {}).get("id", "")),
            "team": t.get("fromTeam", {}).get("abbreviation", ""),
            "type_code": type_code,
            "type_desc": type_desc,
            "description": description,
            "categories": categories,
            "date": t.get("date", ""),
            "resolution_date": t.get("resolutionDate"),
        })
    return records


def run(days: int = 14) -> dict[str, object]:
    news = fetch_rotowire_news()
    transactions = fetch_mlb_transactions(days_back=7)

    news_result = write_rows("player_news", news, on_conflict="source,link")
    txn_result = write_rows("player_transactions", transactions, on_conflict="source,player_id,date,type_code")

    return {
        "source": "news",
        "news_items": len(news),
        "transactions": len(transactions),
        "news_table": news_result["table"],
        "transactions_table": txn_result["table"],
        "dry_run": news_result["dry_run"],
    }
