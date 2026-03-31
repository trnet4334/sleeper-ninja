from __future__ import annotations

from scripts.utils.cache import write_cache_json
from scripts.utils.db import write_rows


def fetch_records(days: int) -> list[dict[str, object]]:
    return [
        {
            "player_id": "jackson-chourio",
            "player_name": "Jackson Chourio",
            "adp": 103.4,
            "source": "fantasypros",
            "days": days,
        },
        {
            "player_id": "nolan-jones",
            "player_name": "Nolan Jones",
            "adp": 147.2,
            "source": "fantasypros",
            "days": days,
        },
    ]


def run(days: int) -> dict[str, object]:
    records = fetch_records(days)
    cache_path = write_cache_json("adp", {"days": days, "records": records})
    write_result = write_rows("market_adp", records)
    return {
        "source": "adp",
        "rows": len(records),
        "cache_path": str(cache_path),
        "target_table": write_result["table"],
        "dry_run": write_result["dry_run"],
    }
