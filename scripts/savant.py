from __future__ import annotations

import re
from datetime import datetime

import pandas as pd

from scripts.utils.cache import write_cache_json
from scripts.utils.db import write_rows


def _slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def _normalize_name(raw: str) -> str:
    """Convert Statcast 'Last, First' → 'First Last' to match fangraphs.py slug keys."""
    raw = raw.strip()
    if ", " in raw:
        parts = raw.split(", ", 1)
        return f"{parts[1]} {parts[0]}"
    return raw


def _f(val: object) -> float | None:
    try:
        return float(val)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return None


def _index_by_mlb_id(df: pd.DataFrame) -> dict[int, dict[str, object]]:
    result: dict[int, dict[str, object]] = {}
    for _, row in df.iterrows():
        pid = row.get("player_id")
        if pid is not None:
            try:
                result[int(pid)] = dict(row)
            except (TypeError, ValueError):
                pass
    return result


def _fetch_batter_records(year: int, days: int) -> list[dict[str, object]]:
    import pybaseball  # lazy import

    # xBA / xSLG / xwOBA from expected stats leaderboard
    expected = pybaseball.statcast_batter_expected_stats(year, minPA=50)
    # barrel%, ev_avg (avg_hit_speed), hard_hit_pct (ev95percent) from exit-velo leaderboard
    ev = pybaseball.statcast_batter_exitvelo_barrels(year, minBBE=50)
    # sprint speed — unique Statcast metric not available on FanGraphs
    sprint = pybaseball.statcast_sprint_speed(year, min_opp=10)

    exp_map = _index_by_mlb_id(expected) if expected is not None and not expected.empty else {}
    ev_map = _index_by_mlb_id(ev) if ev is not None and not ev.empty else {}
    sprint_map = _index_by_mlb_id(sprint) if sprint is not None and not sprint.empty else {}

    all_ids = set(exp_map) | set(ev_map) | set(sprint_map)

    records: list[dict[str, object]] = []
    for pid in all_ids:
        exp_row = exp_map.get(pid, {})
        ev_row = ev_map.get(pid, {})
        sprint_row = sprint_map.get(pid, {})

        raw_name = (
            str(exp_row.get("last_name, first_name") or "")
            or str(ev_row.get("last_name, first_name") or "")
            or str(sprint_row.get("last_name, first_name") or "")
        )
        if not raw_name:
            continue

        player_name = _normalize_name(raw_name)
        team = str(sprint_row.get("team") or exp_row.get("team") or "")

        records.append({
            "player_id": _slug(player_name),
            "days_back": days,
            "player_name": player_name,
            "team": team or None,
            # Statcast expected stats
            "xba": _f(exp_row.get("est_ba")),
            "xslg": _f(exp_row.get("est_slg")),
            "xwoba": _f(exp_row.get("est_woba")),
            # Exit velocity / barrels
            "ev_avg": _f(ev_row.get("avg_hit_speed")),
            "hard_hit_pct": _f(ev_row.get("ev95percent")),
            "barrel_pct": _f(ev_row.get("brl_percent")),
            # Sprint speed (Statcast-only, not available on FanGraphs)
            "sprint_speed": _f(sprint_row.get("sprint_speed")),
        })

    return records


def _fetch_pitcher_records(year: int, days: int) -> list[dict[str, object]]:
    import pybaseball

    expected = pybaseball.statcast_pitcher_expected_stats(year, minPA=50)

    if expected is None or expected.empty:
        return []

    records: list[dict[str, object]] = []
    for _, row in expected.iterrows():
        raw_name = str(row.get("last_name, first_name") or "")
        if not raw_name:
            continue

        player_name = _normalize_name(raw_name)

        records.append({
            "player_id": _slug(player_name),
            "days_back": days,
            "player_name": player_name,
            # xERA and xwOBA-against: key Statcast pitcher metrics
            "xera": _f(row.get("xera")),
            "xwoba_against": _f(row.get("est_woba")),
        })

    return records


def run(days: int = 14) -> dict[str, object]:
    import pybaseball
    pybaseball.cache.enable()

    year = datetime.now().year

    batters = _fetch_batter_records(year, days)
    pitchers = _fetch_pitcher_records(year, days)

    cache_path = write_cache_json(
        "savant",
        {"year": year, "days": days, "batters": len(batters), "pitchers": len(pitchers)},
    )
    batter_result = write_rows("statcast_batters", batters, on_conflict="player_id,days_back")
    pitcher_result = write_rows("statcast_pitchers", pitchers, on_conflict="player_id,days_back")

    return {
        "source": "savant",
        "batters": len(batters),
        "pitchers": len(pitchers),
        "cache_path": str(cache_path),
        "batter_table": batter_result["table"],
        "pitcher_table": pitcher_result["table"],
        "dry_run": batter_result["dry_run"],
    }
