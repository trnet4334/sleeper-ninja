from __future__ import annotations

import io
import re

import httpx
import pandas as pd

from scripts.utils.cache import write_cache_json
from scripts.utils.db import write_rows

FANTASYPROS_ADP_URL = "https://www.fantasypros.com/mlb/adp/overall.php"

# Matches: "Aaron Judge (NYY - LF,CF,RF,DH)"
#           "Shohei Ohtani (LAD - SP,DH)"
_PLAYER_RE = re.compile(r"^(.+?)\s+\((\w+)\s+-\s+([\w,/]+)\)$")
# Ohtani split entries like "Shohei Ohtani (Batter) (LAD - DH)" — skip these
_SPLIT_RE = re.compile(r"\(Batter\)|\(Pitcher\)|\(Two-Way\)", re.IGNORECASE)

_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Accept": "text/html,application/xhtml+xml",
}


def _slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def _f(val: object) -> float | None:
    try:
        return float(val)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return None


def fetch_adp_records() -> list[dict[str, object]]:
    resp = httpx.get(FANTASYPROS_ADP_URL, headers=_HEADERS, timeout=20, follow_redirects=True)
    resp.raise_for_status()

    tables = pd.read_html(io.StringIO(resp.text))
    if not tables:
        return []

    # FantasyPros ADP page: first table is the rankings
    df = tables[0]

    # Expected columns: Rank, Player (Team), Yahoo, CBS, ..., AVG
    if "Player (Team)" not in df.columns or "AVG" not in df.columns:
        return []

    records: list[dict[str, object]] = []
    for _, row in df.iterrows():
        player_cell = str(row.get("Player (Team)") or "")

        # Skip Ohtani split entries (batter-only or pitcher-only rows)
        if _SPLIT_RE.search(player_cell):
            continue

        m = _PLAYER_RE.match(player_cell)
        if not m:
            continue

        player_name, team, position = m.group(1).strip(), m.group(2), m.group(3)
        # Normalise position: take the first eligible role
        # e.g. "LF,CF,RF,DH" → "OF" is outside scope; keep raw for now
        adp_val = _f(row.get("AVG"))
        if adp_val is None:
            # Fall back to Yahoo ADP if consensus is missing
            adp_val = _f(row.get("Yahoo"))
        if adp_val is None:
            continue

        records.append({
            "player_id": _slug(player_name),
            "player_name": player_name,
            "position": position,
            "adp": adp_val,
        })

    return records


def run(days: int = 14) -> dict[str, object]:
    # days param not used — ADP is a current snapshot, not windowed
    void = days

    records = fetch_adp_records()

    cache_path = write_cache_json("adp", {"count": len(records), "preview": records[:3]})
    write_result = write_rows("adp", records, on_conflict="player_id")

    return {
        "source": "adp",
        "rows": len(records),
        "cache_path": str(cache_path),
        "target_table": write_result["table"],
        "dry_run": write_result["dry_run"],
    }
