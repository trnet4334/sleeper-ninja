from __future__ import annotations

from scripts.utils.cache import write_cache_json
from scripts.utils.db import write_rows


def fetch_records(days: int) -> list[dict[str, object]]:
    return [
        {
            "player_id": "josh-lowe",
            "player_name": "Josh Lowe",
            "team": "TB",
            "il_type": "IL10",
            "days": days,
        },
        {
            "player_id": "aaron-judge",
            "player_name": "Aaron Judge",
            "team": "NYY",
            "status": "active",
            "days": days,
        },
    ]


def run(days: int) -> dict[str, object]:
    records = fetch_records(days)
    cache_path = write_cache_json("mlb_stats", {"days": days, "records": records})
    write_result = write_rows("injuries_and_status", records)
    return {
        "source": "mlb_stats",
        "rows": len(records),
        "cache_path": str(cache_path),
        "target_table": write_result["table"],
        "dry_run": write_result["dry_run"],
    }
