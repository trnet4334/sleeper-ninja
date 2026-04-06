"""Backfill position/role values in statcast tables from the ADP snapshot.

statcast_batters.position  — FanGraphs doesn't expose position; filled with "—" or left null
statcast_pitchers.role     — ADP is the authoritative source for SP/RP/CL classification.
                             fangraphs.py infers role from SV/HLD/GS which is unreliable
                             early in the season (all zeros → everyone becomes SP).
                             ADP always overrides when it has a pitcher-eligible role.

This script runs after adp.run() so the local JSON exports are fresh.
It reads from public/exports/*.json, merges ADP position data, then
upserts the enriched rows back via write_rows().
"""
from __future__ import annotations

import json
from pathlib import Path

from scripts.utils.db import write_rows

_PUBLIC_EXPORTS = Path(__file__).resolve().parents[1] / "public" / "exports"

_PITCHER_ROLES = {"SP", "RP", "CL"}


def _load(table: str) -> list[dict[str, object]]:
    path = _PUBLIC_EXPORTS / f"{table}.json"
    if not path.exists():
        return []
    return json.loads(path.read_text())


def run(days: int = 14) -> dict[str, object]:  # noqa: ARG001 — days unused, kept for pipeline compat
    adp_records = _load("adp")
    position_map: dict[str, str] = {
        str(r["player_id"]): str(r["position"])
        for r in adp_records
        if r.get("player_id") and r.get("position")
    }

    if not position_map:
        return {"source": "backfill", "skipped": True, "reason": "adp export empty"}

    # --- statcast_batters: fill position where null or placeholder ---
    batters = _load("statcast_batters")
    filled_batters = 0
    updated_batters: list[dict[str, object]] = []
    for row in batters:
        pid = str(row.get("player_id", ""))
        current_pos = row.get("position")
        if (not current_pos or current_pos == "—") and pid in position_map:
            row = {**row, "position": position_map[pid]}
            filled_batters += 1
        updated_batters.append(row)

    # --- statcast_pitchers: use ADP as authoritative role source ---
    # fangraphs infers SP/RP from SV/HLD/GS which is unreliable early in the season
    # (all zeros → every pitcher becomes SP). Always apply ADP when it has a valid role.
    # Compound roles like "SP,RP" are preserved in full so swingmen appear in both tabs.
    pitchers = _load("statcast_pitchers")
    filled_pitchers = 0
    updated_pitchers: list[dict[str, object]] = []
    for row in pitchers:
        pid = str(row.get("player_id", ""))
        if pid in position_map:
            # Keep all pitcher-eligible tokens (e.g. "SP,RP" → "SP,RP", "SP,DH" → "SP")
            eligible = [tok.strip() for tok in position_map[pid].split(",") if tok.strip() in _PITCHER_ROLES]
            adp_role = ",".join(eligible) if eligible else None
            if adp_role and adp_role != row.get("role"):
                row = {**row, "role": adp_role}
                filled_pitchers += 1
        updated_pitchers.append(row)

    batter_result = write_rows("statcast_batters", updated_batters, on_conflict="player_id,days_back")
    pitcher_result = write_rows("statcast_pitchers", updated_pitchers, on_conflict="player_id,days_back")

    return {
        "source": "backfill",
        "batter_positions_filled": filled_batters,
        "pitcher_roles_filled": filled_pitchers,
        "batter_table": batter_result["table"],
        "pitcher_table": pitcher_result["table"],
        "dry_run": batter_result["dry_run"],
    }
