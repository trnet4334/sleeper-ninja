from __future__ import annotations

import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]


class RepoLayoutTests(unittest.TestCase):
    def test_frontend_and_api_roots_exist(self) -> None:
        self.assertTrue((REPO_ROOT / "src" / "App.tsx").exists())
        self.assertTrue((REPO_ROOT / "api" / "data" / "players.ts").exists())
        self.assertTrue((REPO_ROOT / "public" / "pwa-192.svg").exists())

    def test_package_json_declares_core_web_stack(self) -> None:
        package_json = (REPO_ROOT / "package.json").read_text()
        self.assertIn('"react-router-dom"', package_json)
        self.assertIn('"zustand"', package_json)
        self.assertIn('"vite-plugin-pwa"', package_json)


if __name__ == "__main__":
    unittest.main()
