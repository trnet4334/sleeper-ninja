from __future__ import annotations

import re
from datetime import datetime

import pandas as pd

from scripts.utils.cache import write_cache_json
from scripts.utils.db import write_rows


def _slug(name: str) -> str:
    """Convert a player name to a kebab-case slug, e.g. 'Aaron Judge' → 'aaron-judge'."""
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def _fetch_batters(season: int, days_back: int, min_pa: int = 50) -> list[dict[str, object]]:
    import pybaseball  # lazy import so tests don't require the package

    df: pd.DataFrame = pybaseball.batting_stats(season, qual=min_pa)

    records = []
    for _, row in df.iterrows():
        name = str(row.get("Name", ""))
        if not name:
            continue
        records.append({
            "player_id": _slug(name),
            "days_back": days_back,
            "player_name": name,
            "team": str(row.get("Team", "")),
            "position": "—",  # FanGraphs batting_stats doesn't include position
            "avg": _f(row.get("AVG")),
            "obp": _f(row.get("OBP")),
            "hr": _i(row.get("HR")),
            "sb": _i(row.get("SB")),
            "tb": _i(row.get("TB")),
            "bb": _i(row.get("BB")),
            "xba": _f(row.get("xBA")),
            "xwoba": _f(row.get("xwOBA")),
            "xslg": _f(row.get("xSLG")),
            "barrel_pct": _f(row.get("Barrel%")),
            "hard_hit_pct": _f(row.get("HardHit%")),
            "ev_avg": _f(row.get("EV")),
            "k_pct": _f(row.get("K%")),
            "bb_pct": _f(row.get("BB%")),
        })
    return records


def _fetch_pitchers(season: int, days_back: int, min_ip: int = 10) -> list[dict[str, object]]:
    import pybaseball

    df: pd.DataFrame = pybaseball.pitching_stats(season, qual=min_ip)

    records = []
    for _, row in df.iterrows():
        name = str(row.get("Name", ""))
        if not name:
            continue
        records.append({
            "player_id": _slug(name),
            "days_back": days_back,
            "player_name": name,
            "team": str(row.get("Team", "")),
            "role": "SP",
            "era": _f(row.get("ERA")),
            "whip": _f(row.get("WHIP")),
            "k": _i(row.get("SO")),
            "w": _i(row.get("W")),
            "sv": _i(row.get("SV")),
            "hld": _i(row.get("HLD")),
            "xera": _f(row.get("xERA")),
            "xfip": _f(row.get("xFIP")),
            "swstr_pct": _f(row.get("SwStr%")),
            "csw_pct": _f(row.get("CSW%")),
            "k_pct": _f(row.get("K%")),
            "bb_pct": _f(row.get("BB%")),
        })
    return records


def _f(val: object) -> float | None:
    try:
        return float(val)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return None


def _i(val: object) -> int | None:
    try:
        return int(float(val))  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return None


def run(days: int = 14) -> dict[str, object]:
    season = datetime.now().year
    batters = _fetch_batters(season, days_back=days)
    pitchers = _fetch_pitchers(season, days_back=days)

    cache_path = write_cache_json(
        "fangraphs",
        {"season": season, "days": days, "batters": len(batters), "pitchers": len(pitchers)},
    )
    batter_result = write_rows("statcast_batters", batters, on_conflict="player_id,days_back")
    pitcher_result = write_rows("statcast_pitchers", pitchers, on_conflict="player_id,days_back")

    return {
        "source": "fangraphs",
        "batters": len(batters),
        "pitchers": len(pitchers),
        "cache_path": str(cache_path),
        "batter_table": batter_result["table"],
        "pitcher_table": pitcher_result["table"],
        "dry_run": batter_result["dry_run"],
    }
