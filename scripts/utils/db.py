from __future__ import annotations

import json
import os
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
EXPORT_DIR = REPO_ROOT / "data" / "exports"


def load_supabase_config_from_env() -> dict[str, object]:
    url = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL", "")
    key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY", "")
    return {
        "url": url,
        "key": key,
        "service_key_present": bool(key),
        "configured": bool(url and key),
    }


def write_rows(
    table: str,
    rows: list[dict[str, object]],
    on_conflict: str = "player_id",
) -> dict[str, object]:
    EXPORT_DIR.mkdir(parents=True, exist_ok=True)
    config = load_supabase_config_from_env()

    contract: dict[str, object] = {
        "table": table,
        "rows": len(rows),
        "dry_run": not config["configured"],
        "configured": config["configured"],
        "target_url": config["url"],
    }

    # Always write local export for audit / debugging
    target = EXPORT_DIR / f"last_write_{table}.json"
    target.write_text(json.dumps({"contract": contract, "preview": rows[:2]}, indent=2, sort_keys=True))

    if config["configured"] and rows:
        from supabase import create_client  # lazy import — only needed when configured

        client = create_client(str(config["url"]), str(config["key"]))
        client.table(table).upsert(rows, on_conflict=on_conflict).execute()

    return contract
