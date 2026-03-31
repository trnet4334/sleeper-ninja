from __future__ import annotations

import json
import subprocess
import sys
import unittest
from pathlib import Path

from scripts.utils.cache import read_cache_json
from scripts.utils.db import load_supabase_config_from_env, write_rows


REPO_ROOT = Path(__file__).resolve().parents[1]


class PipelineTests(unittest.TestCase):
    def test_write_rows_emits_contract(self) -> None:
        contract = write_rows("statcast_daily", [{"player_id": "1"}])

        self.assertEqual(contract["table"], "statcast_daily")
        self.assertEqual(contract["rows"], 1)
        self.assertTrue(contract["dry_run"])

    def test_fetch_all_supports_source_scoped_refresh(self) -> None:
        completed = subprocess.run(
            [sys.executable, "scripts/fetch_all.py", "--source", "savant", "--days", "7"],
            cwd=REPO_ROOT,
            check=True,
            capture_output=True,
            text=True,
        )

        payload = json.loads(completed.stdout)
        self.assertEqual(payload["days"], 7)
        self.assertEqual(len(payload["sources"]), 1)
        self.assertEqual(payload["sources"][0]["source"], "savant")
        self.assertEqual(read_cache_json("savant")["days"], 7)

    def test_fetch_all_runs_all_sources(self) -> None:
        completed = subprocess.run(
            [sys.executable, "scripts/fetch_all.py"],
            cwd=REPO_ROOT,
            check=True,
            capture_output=True,
            text=True,
        )

        payload = json.loads(completed.stdout)
        self.assertEqual(len(payload["sources"]), 4)

    def test_supabase_config_defaults_to_dry_run(self) -> None:
        config = load_supabase_config_from_env()
        self.assertFalse(config["configured"])


if __name__ == "__main__":
    unittest.main()
