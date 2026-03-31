from __future__ import annotations

import json
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[2]
CACHE_DIR = REPO_ROOT / "data" / "cache"


def write_cache_json(source: str, payload: dict[str, object]) -> Path:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    target = CACHE_DIR / f"{source}.json"
    target.write_text(json.dumps(payload, indent=2, sort_keys=True))
    return target


def read_cache_json(source: str) -> dict[str, object]:
    target = CACHE_DIR / f"{source}.json"
    if not target.exists():
        return {}
    return json.loads(target.read_text())
