from __future__ import annotations

from scripts.utils.cache import write_cache_json
from scripts.utils.db import write_rows


def fetch_records(days: int) -> list[dict[str, object]]:
    return [
        {
            "player_id": "jackson-chourio",
            "player_name": "Jackson Chourio",
            "team": "MIL",
            "date_range": f"{days}d",
            "xwoba": 0.388,
            "barrel_pct": 12.8,
        },
        {
            "player_id": "taj-bradley",
            "player_name": "Taj Bradley",
            "team": "TB",
            "date_range": f"{days}d",
            "xera": 3.46,
            "swstr_pct": 14.9,
        },
    ]


def run(days: int) -> dict[str, object]:
    records = fetch_records(days)
    cache_path = write_cache_json("savant", {"days": days, "records": records})
    write_result = write_rows("statcast_daily", records)
    return {
        "source": "savant",
        "rows": len(records),
        "cache_path": str(cache_path),
        "target_table": write_result["table"],
        "dry_run": write_result["dry_run"],
    }
