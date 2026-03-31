from __future__ import annotations

import re
from datetime import datetime, timedelta

import httpx

from scripts.utils.cache import write_cache_json
from scripts.utils.db import write_rows

MLB_TRANSACTIONS_URL = "https://statsapi.mlb.com/api/v1/transactions"

_IL_PATTERNS = [
    (r"\b60-day\b", "IL60"),
    (r"\b15-day\b", "IL15"),
    (r"\b10-day\b", "IL10"),
    (r"\b7-day\b", "IL7"),
]


def _slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def _il_type_from_description(desc: str) -> str:
    for pattern, label in _IL_PATTERNS:
        if re.search(pattern, desc, re.IGNORECASE):
            return label
    return "IL"


def _fetch_team_abbreviations() -> dict[int, str]:
    """Build a team_id → abbreviation map from the MLB teams endpoint."""
    try:
        resp = httpx.get(
            "https://statsapi.mlb.com/api/v1/teams",
            params={"sportId": "1"},
            timeout=10,
            headers={"Accept": "application/json"},
        )
        resp.raise_for_status()
        return {
            t["id"]: t.get("abbreviation", t.get("teamCode", ""))
            for t in resp.json().get("teams", [])
        }
    except Exception:
        return {}


def fetch_il_placements(days: int) -> list[dict[str, object]]:
    today = datetime.now().date()
    start = today - timedelta(days=days)

    team_abbr = _fetch_team_abbreviations()

    resp = httpx.get(
        MLB_TRANSACTIONS_URL,
        params={
            "startDate": start.strftime("%Y-%m-%d"),
            "endDate": today.strftime("%Y-%m-%d"),
            "sportId": "1",
        },
        timeout=20,
        headers={"Accept": "application/json"},
    )
    resp.raise_for_status()

    transactions: list[dict] = resp.json().get("transactions", [])

    # Keep only IL placements (description contains "placed" + "injured list")
    il_placements = [
        t for t in transactions
        if "placed" in t.get("description", "").lower()
        and "injured list" in t.get("description", "").lower()
    ]

    # Deduplicate: if a player has multiple placements in the window, keep the latest
    latest: dict[str, dict] = {}
    for txn in il_placements:
        person = txn.get("person", {})
        player_name = person.get("fullName", "")
        if not player_name:
            continue

        pid = _slug(player_name)
        txn_date = txn.get("date") or txn.get("effectiveDate") or today.strftime("%Y-%m-%d")

        existing = latest.get(pid)
        if existing is None or txn_date > existing["date"]:
            desc = txn.get("description", "")
            team_obj = txn.get("toTeam") or txn.get("fromTeam") or {}
            team_id = team_obj.get("id")
            abbr = team_abbr.get(team_id, "") if team_id else ""
            latest[pid] = {
                "player_id": pid,
                "date": txn_date,
                "player_name": player_name,
                "team": abbr,
                "il_type": _il_type_from_description(desc),
                "description": desc,
            }

    return list(latest.values())


def run(days: int = 14) -> dict[str, object]:
    records = fetch_il_placements(days)

    cache_path = write_cache_json("mlb_stats", {"days": days, "count": len(records), "preview": records[:3]})
    write_result = write_rows("injuries", records, on_conflict="player_id,date")

    return {
        "source": "mlb_stats",
        "rows": len(records),
        "cache_path": str(cache_path),
        "target_table": write_result["table"],
        "dry_run": write_result["dry_run"],
    }
