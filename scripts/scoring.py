"""
F-score computation engine (v2).

Reads statcast_batters / statcast_pitchers from local exports (or Supabase),
computes per-player F-scores across 5 layers (A–E), and writes results back.

Layers:
  [A] Category Z-score        60% weight
  [B] xStat correction        15% weight
  [C] Contact / stability      10% weight
  [D] SB / role independent    triggered by category
  [E] Adjustment layer         15% weight (hotness, market edge, injury)
"""
from __future__ import annotations

import json
import math
import os
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]

# ---------------------------------------------------------------------------
# Default league config (Viva el Birdos: 6-category + OBP)
# ---------------------------------------------------------------------------
DEFAULT_BATTER_CATS: list[str] = ["AVG", "HR", "RBI", "SB", "TB", "OBP"]
DEFAULT_PITCHER_CATS: list[str] = ["W", "SV", "K", "ERA", "WHIP", "HLD"]

# Scarcity weights — initial reference values from spec
SCARCITY_WEIGHTS: dict[str, float] = {
    # Batters (Viva el Birdos)
    "R": 1.0, "HR": 1.1, "RBI": 1.0, "SB": 1.8,
    "TB": 1.1, "AVG": 1.3, "OBP": 1.2, "H": 1.2,
    "BB": 1.3, "SLG": 1.1,
    # Pitchers (Viva el Birdos)
    "W": 1.1, "SV": 1.6, "K": 1.2, "HLD": 1.5,
    "ERA": 1.1, "WHIP": 1.1, "QS": 1.2,
    "K/BB": 1.3, "RAPP": 1.5, "SV+H": 1.4, "IP": 1.0,
}

# Categories where lower value is better (Z flipped before adding)
LOWER_IS_BETTER: set[str] = {"ERA", "WHIP"}

# Fantasy category → DB column
BATTER_CAT_TO_COL: dict[str, str] = {
    "AVG": "avg", "OBP": "obp", "HR": "hr",
    "SB": "sb", "TB": "tb", "BB": "bb",
    "R": "r", "RBI": "rbi", "H": "h", "SLG": "slg",
}
PITCHER_CAT_TO_COL: dict[str, str] = {
    "ERA": "era", "WHIP": "whip", "K": "k",
    "W": "w", "SV": "sv", "HLD": "hld",
    "QS": "qs", "IP": "ip",
}

# Coefficients (from spec)
ALPHA = 0.25    # xStat correction
BETA = 0.15     # contact / stability quality
EPSILON = 0.15  # recent hotness
ZETA = 0.10     # market edge
ETA = 0.50      # injury penalty

INJURY_PENALTY: dict[str, float] = {
    "DTD": 0.3, "IL10": 0.8, "IL15": 1.0, "IL60": 1.5,
}

# Stat columns to build Z-score populations for
BATTER_STAT_COLS: list[str] = [
    "avg", "obp", "hr", "sb", "tb", "bb",
    "xba", "xslg", "xwoba",
    "barrel_pct", "ld_pct", "bb_pct", "whiff_pct", "sprint_speed",
    "hard_hit_pct", "ev_avg",
]
PITCHER_STAT_COLS: list[str] = [
    "era", "whip", "k", "w", "sv", "hld",
    "xera", "xfip", "xwoba_against",
    "gb_pct", "hard_hit_pct", "bb_pct", "csw_pct", "lob_pct",
    "k_pct",
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _f(val: object) -> float | None:
    try:
        f = float(val)  # type: ignore[arg-type]
        return None if math.isnan(f) else f
    except (TypeError, ValueError):
        return None


def _build_z_maps(
    players: list[dict],
    cols: list[str],
) -> dict[str, dict[str, float]]:
    """For each stat column, return {player_id → z_score} across the population."""
    z_maps: dict[str, dict[str, float]] = {}
    for col in cols:
        values = [_f(p.get(col)) for p in players]
        valid = [v for v in values if v is not None]
        if len(valid) < 2:
            z_maps[col] = {p["player_id"]: 0.0 for p in players}
            continue
        mean = sum(valid) / len(valid)
        std = math.sqrt(sum((v - mean) ** 2 for v in valid) / len(valid))
        if std == 0.0:
            z_maps[col] = {p["player_id"]: 0.0 for p in players}
        else:
            z_maps[col] = {
                p["player_id"]: ((_f(p.get(col)) or mean) - mean) / std
                for p in players
            }
    return z_maps


def _z(z_maps: dict[str, dict[str, float]], col: str, pid: str) -> float:
    return z_maps.get(col, {}).get(pid, 0.0)


# ---------------------------------------------------------------------------
# Batter scoring
# ---------------------------------------------------------------------------

def _score_batter(
    player: dict,
    z_maps: dict[str, dict[str, float]],
    categories: list[str],
    injury_status: str,
    hotness: float = 0.0,
    market_edge: float = 0.0,
) -> float:
    pid = str(player["player_id"])

    # [A] Category Z-score layer
    a_score = 0.0
    for cat in categories:
        col = BATTER_CAT_TO_COL.get(cat)
        if col is None:
            continue
        z = _z(z_maps, col, pid)
        if cat in LOWER_IS_BETTER:
            z = -z
        a_score += z * SCARCITY_WEIGHTS.get(cat, 1.0)

    # [B] xStat correction layer
    b_score = 0.0
    has_avg = any(c in categories for c in ("AVG", "H"))
    has_slg = any(c in categories for c in ("SLG", "TB", "HR", "RBI"))

    if has_avg:
        b_score += ALPHA * (_z(z_maps, "xba", pid) - _z(z_maps, "avg", pid))
    if has_slg:
        slg_ref = _z(z_maps, "slg", pid) if "slg" in z_maps else _z(z_maps, "tb", pid)
        b_score += ALPHA * (_z(z_maps, "xslg", pid) - slg_ref)
    # General xwOBA delta (0.5× to avoid double-counting)
    b_score += (ALPHA * 0.5) * (_z(z_maps, "xwoba", pid) - _z(z_maps, "avg", pid))

    # [C] Contact quality layer
    c_dims: list[float] = []
    if has_slg:
        c_dims.append(_z(z_maps, "barrel_pct", pid))
    if has_avg:
        c_dims.append(_z(z_maps, "ld_pct", pid))
    if any(c in categories for c in ("BB", "OBP")):
        c_dims.append(_z(z_maps, "bb_pct", pid))
    if "K" in categories:  # K as negative batter stat
        c_dims.append(-_z(z_maps, "whiff_pct", pid))
    c_score = BETA * sum(c_dims)

    # [D] SB independent layer
    d_score = 0.0
    if "SB" in categories:
        sprint_z = _z(z_maps, "sprint_speed", pid)
        sb_pct_raw = _f(player.get("sb_pct"))
        if sb_pct_raw is not None:
            sb_weight = 1.0 if sb_pct_raw >= 0.80 else (0.8 if sb_pct_raw >= 0.70 else 0.5)
        else:
            sb_weight = 0.8  # neutral default
        d_score = sprint_z * sb_weight * SCARCITY_WEIGHTS.get("SB", 1.8)

    # [E] Adjustment layer
    injury_pen = INJURY_PENALTY.get(injury_status.upper() if injury_status else "", 0.0)
    e_score = (EPSILON * hotness) + (ZETA * market_edge) - (ETA * injury_pen)

    return round(a_score + b_score + c_score + d_score + e_score, 4)


# ---------------------------------------------------------------------------
# Pitcher scoring
# ---------------------------------------------------------------------------

def _score_pitcher(
    player: dict,
    z_maps: dict[str, dict[str, float]],
    categories: list[str],
    injury_status: str,
    hotness: float = 0.0,
    market_edge: float = 0.0,
) -> float:
    pid = str(player["player_id"])

    # [A] Category Z-score layer
    a_score = 0.0
    for cat in categories:
        col = PITCHER_CAT_TO_COL.get(cat)
        if col is None:
            continue
        z = _z(z_maps, col, pid)
        if cat in LOWER_IS_BETTER:
            z = -z
        a_score += z * SCARCITY_WEIGHTS.get(cat, 1.0)

    # [B] xStat correction layer
    b_score = 0.0
    has_era = any(c in categories for c in ("ERA", "QS", "W"))
    has_k = any(c in categories for c in ("K", "K/BB"))
    has_whip = any(c in categories for c in ("WHIP", "K/BB"))

    if has_era:
        ip = _f(player.get("ip")) or 0.0
        x_col = "xera" if ip >= 15 else "xfip"
        # ERA Z negated (lower ERA = better), xERA Z also negated → positive delta = ERA worse than expected
        era_z = -_z(z_maps, "era", pid)
        x_z = -_z(z_maps, x_col, pid)
        b_score += ALPHA * (era_z - x_z)

        # LOB% correction: LOB% > 72% means ERA being suppressed → will rise → deduct
        lob_pct = _f(player.get("lob_pct"))
        if lob_pct is not None:
            lob_delta = lob_pct - 0.72
            b_score += (ALPHA * 0.5) * (-lob_delta)

    if has_k:
        csw_z = _z(z_maps, "csw_pct", pid)
        k_z = _z(z_maps, "k", pid)
        b_score += ALPHA * (csw_z - k_z * 0.5)

    if has_whip:
        bb_pct_z = _z(z_maps, "bb_pct", pid)
        b_score += ALPHA * (-bb_pct_z)  # lower BB% is better

    # [C] Stability layer (GB% - HardHit%_against)
    c_score = 0.0
    if any(c in categories for c in ("ERA", "WHIP", "QS")):
        gb_z = _z(z_maps, "gb_pct", pid)
        hh_z = _z(z_maps, "hard_hit_pct", pid)
        c_score = BETA * (gb_z - hh_z)

    # [D] Role layer (saves/holds league only)
    d_score = 0.0
    if any(c in categories for c in ("SV", "HLD", "SV+H", "RAPP")):
        role = str(player.get("role") or "").upper()
        if role == "CL":
            d_score = 1.5
        elif role in ("SHD", "RCL", "RP"):
            d_score = 0.5

    # [E] Adjustment layer
    injury_pen = INJURY_PENALTY.get(injury_status.upper() if injury_status else "", 0.0)
    e_score = (EPSILON * hotness) + (ZETA * market_edge) - (ETA * injury_pen)

    return round(a_score + b_score + c_score + d_score + e_score, 4)


# ---------------------------------------------------------------------------
# Hotness helper
# ---------------------------------------------------------------------------

def _build_hotness_map(
    recent: list[dict],
    baseline: list[dict],
    z_maps_recent: dict[str, dict[str, float]],
    categories: list[str],
    col_map: dict[str, str],
) -> dict[str, float]:
    """Return {player_id → hotness} = mean(Z_recent - Z_baseline) across categories."""
    if not baseline:
        return {}
    baseline_ids = {p["player_id"] for p in baseline}
    cols = [col_map[c] for c in categories if c in col_map]
    z_baseline = _build_z_maps(baseline, cols)
    hotness: dict[str, float] = {}
    for p in recent:
        pid = p["player_id"]
        if pid not in baseline_ids:
            continue
        deltas: list[float] = []
        for cat in categories:
            col = col_map.get(cat)
            if col is None:
                continue
            sign = -1.0 if cat in LOWER_IS_BETTER else 1.0
            deltas.append(sign * (
                z_maps_recent.get(col, {}).get(pid, 0.0)
                - z_baseline.get(col, {}).get(pid, 0.0)
            ))
        hotness[pid] = sum(deltas) / len(deltas) if deltas else 0.0
    return hotness


# ---------------------------------------------------------------------------
# Data I/O
# ---------------------------------------------------------------------------

def _load_json(table: str) -> list[dict]:
    path = REPO_ROOT / "public" / "exports" / f"{table}.json"
    if path.exists():
        try:
            return json.loads(path.read_text())
        except Exception:
            return []
    return []


def _load_from_supabase(table: str) -> list[dict]:
    url = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL", "")
    key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY", "")
    if not (url and key):
        return []
    try:
        from supabase import create_client
        client = create_client(url, key)
        return client.table(table).select("*").execute().data or []
    except Exception:
        return []


def _save_f_scores(table: str, score_map: dict[tuple[str, int], float]) -> None:
    """Merge f_scores into the existing local JSON export."""
    path = REPO_ROOT / "public" / "exports" / f"{table}.json"
    if not path.exists():
        return
    rows = json.loads(path.read_text())
    for row in rows:
        key = (str(row.get("player_id", "")), int(row.get("days_back", 0)))
        if key in score_map:
            row["f_score"] = score_map[key]
    path.write_text(json.dumps(rows, indent=2))


def _push_to_supabase(table: str, score_rows: list[dict]) -> None:
    """Update f_score on existing rows only — does not create new rows."""
    url = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL", "")
    key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY", "")
    if not (url and key) or not score_rows:
        return
    from supabase import create_client
    client = create_client(url, key)
    for row in score_rows:
        client.table(table).update({"f_score": row["f_score"]}).eq("player_id", row["player_id"]).eq("days_back", row["days_back"]).execute()


def _load_injury_map() -> dict[str, str]:
    """Return {player_id → il_type} from Supabase injuries table."""
    url = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL", "")
    key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY", "")
    if not (url and key):
        return {}
    try:
        from supabase import create_client
        client = create_client(url, key)
        rows = client.table("injuries").select("player_id,il_type").order("date", desc=True).execute().data or []
        seen: dict[str, str] = {}
        for row in rows:
            pid = str(row.get("player_id", ""))
            if pid and pid not in seen:
                seen[pid] = str(row.get("il_type", "") or "")
        return seen
    except Exception:
        return {}


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

def run(days: int = 14) -> dict[str, object]:
    """Compute F-scores for all players and write results back."""
    # Load all windows (7 / 14 / 30)
    all_batters = _load_json("statcast_batters") or _load_from_supabase("statcast_batters")
    all_pitchers = _load_json("statcast_pitchers") or _load_from_supabase("statcast_pitchers")

    batters_main = [p for p in all_batters if p.get("days_back") == days]
    pitchers_main = [p for p in all_pitchers if p.get("days_back") == days]
    # 7-day window for hotness (recent = 7d, baseline = main window)
    batters_7 = [p for p in all_batters if p.get("days_back") == 7]
    pitchers_7 = [p for p in all_pitchers if p.get("days_back") == 7]

    injury_map = _load_injury_map()

    # Build population Z-score maps
    batter_z = _build_z_maps(batters_main, BATTER_STAT_COLS)
    pitcher_z = _build_z_maps(pitchers_main, PITCHER_STAT_COLS)
    batter_z_7 = _build_z_maps(batters_7, BATTER_STAT_COLS) if batters_7 else {}
    pitcher_z_7 = _build_z_maps(pitchers_7, PITCHER_STAT_COLS) if pitchers_7 else {}

    # Hotness: Z(7d) - Z(main window)
    batter_hotness = _build_hotness_map(
        batters_7, batters_main, batter_z_7, DEFAULT_BATTER_CATS, BATTER_CAT_TO_COL
    )
    pitcher_hotness = _build_hotness_map(
        pitchers_7, pitchers_main, pitcher_z_7, DEFAULT_PITCHER_CATS, PITCHER_CAT_TO_COL
    )

    # Score batters
    batter_score_map: dict[tuple[str, int], float] = {}
    batter_upsert: list[dict] = []
    for p in batters_main:
        pid = str(p["player_id"])
        score = _score_batter(
            p, batter_z, DEFAULT_BATTER_CATS,
            injury_map.get(pid, ""),
            batter_hotness.get(pid, 0.0),
        )
        batter_score_map[(pid, days)] = score
        batter_upsert.append({"player_id": pid, "days_back": days, "f_score": score})

    # Score pitchers
    pitcher_score_map: dict[tuple[str, int], float] = {}
    pitcher_upsert: list[dict] = []
    for p in pitchers_main:
        pid = str(p["player_id"])
        score = _score_pitcher(
            p, pitcher_z, DEFAULT_PITCHER_CATS,
            injury_map.get(pid, ""),
            pitcher_hotness.get(pid, 0.0),
        )
        pitcher_score_map[(pid, days)] = score
        pitcher_upsert.append({"player_id": pid, "days_back": days, "f_score": score})

    # Write back: local JSON + Supabase
    _save_f_scores("statcast_batters", batter_score_map)
    _save_f_scores("statcast_pitchers", pitcher_score_map)
    _push_to_supabase("statcast_batters", batter_upsert)
    _push_to_supabase("statcast_pitchers", pitcher_upsert)

    top_batters = sorted(batter_upsert, key=lambda x: x["f_score"], reverse=True)[:5]
    top_pitchers = sorted(pitcher_upsert, key=lambda x: x["f_score"], reverse=True)[:5]

    return {
        "source": "scoring",
        "batters_scored": len(batter_upsert),
        "pitchers_scored": len(pitcher_upsert),
        "days_back": days,
        "top_batters": [{"player_id": p["player_id"], "f_score": p["f_score"]} for p in top_batters],
        "top_pitchers": [{"player_id": p["player_id"], "f_score": p["f_score"]} for p in top_pitchers],
    }
