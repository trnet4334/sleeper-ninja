from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from scripts import adp, backfill, fangraphs, mlb_stats, news, savant, scoring


SOURCES = {
    "savant": savant.run,
    "mlb_stats": mlb_stats.run,
    "fangraphs": fangraphs.run,
    "adp": adp.run,
    "news": news.run,
    "backfill": backfill.run,
    "scoring": scoring.run,
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Sleeper Ninja data ingestion orchestrator")
    parser.add_argument("--source", choices=SOURCES.keys())
    parser.add_argument("--days", type=int, default=14)
    return parser.parse_args()


DATA_SOURCES = ["savant", "mlb_stats", "fangraphs", "adp", "news", "backfill"]


def main() -> None:
    args = parse_args()

    if args.source:
        # Single-source run: run it, then always recompute scores
        selected = [args.source] if args.source != "scoring" else []
    else:
        selected = DATA_SOURCES

    summary: dict[str, object] = {"days": args.days, "sources": []}

    for source_name in selected:
        try:
            result = SOURCES[source_name](days=args.days)
        except Exception as exc:  # noqa: BLE001
            result = {"source": source_name, "error": str(exc)}
            print(f"[{source_name}] error: {exc}", file=sys.stderr)
        summary["sources"].append(result)  # type: ignore[union-attr]

    # Always recompute F-scores after any data update
    score_result = scoring.run(days=args.days)
    summary["sources"].append(score_result)  # type: ignore[union-attr]

    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
