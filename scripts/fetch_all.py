from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from scripts import adp, fangraphs, mlb_stats, savant


SOURCES = {
    "savant": savant.run,
    "mlb_stats": mlb_stats.run,
    "fangraphs": fangraphs.run,
    "adp": adp.run,
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Sleeper Ninja data ingestion orchestrator")
    parser.add_argument("--source", choices=SOURCES.keys())
    parser.add_argument("--days", type=int, default=14)
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    selected_sources = [args.source] if args.source else list(SOURCES.keys())
    summary = {
        "days": args.days,
        "sources": [],
    }

    for source_name in selected_sources:
        result = SOURCES[source_name](days=args.days)
        summary["sources"].append(result)

    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
