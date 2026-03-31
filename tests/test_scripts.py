from __future__ import annotations

import json
import subprocess
import sys
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]


class ScriptTests(unittest.TestCase):
    def run_script(self, *args: str) -> str:
        completed = subprocess.run(
            [sys.executable, *args],
            cwd=REPO_ROOT,
            check=True,
            capture_output=True,
            text=True,
        )
        return completed.stdout.strip()

    def test_fetch_all_runs_with_default_args(self) -> None:
        payload = json.loads(self.run_script("scripts/fetch_all.py"))
        self.assertEqual(payload["days"], 14)
        self.assertEqual(len(payload["sources"]), 4)

    def test_fetch_all_runs_for_single_source(self) -> None:
        # savant fetches real Statcast data; assert structure, not exact row count
        payload = json.loads(self.run_script("scripts/fetch_all.py", "--source", "savant", "--days", "7"))
        result = payload["sources"][0]
        self.assertEqual(result["source"], "savant")
        self.assertIn("batters", result)
        self.assertIn("pitchers", result)
        self.assertIsInstance(result["batters"], int)
        self.assertIsInstance(result["pitchers"], int)


if __name__ == "__main__":
    unittest.main()
