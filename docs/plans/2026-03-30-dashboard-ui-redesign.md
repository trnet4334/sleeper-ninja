# Dashboard UI Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the Streamlit dashboard shell and all five pages so they visually follow the prototype dashboard mockup while preserving the current Python data-shaping layer.

**Architecture:** Add a shared dashboard UI helper module for CSS tokens and reusable rendering primitives, then update `src/dashboard/app.py` to own the prototype-style shell. Rewrite each page renderer to emit consistent metric cards, chips, tables, and grids using existing or lightly extended view models.

**Tech Stack:** Python, Streamlit, existing dashboard page modules, lightweight HTML/CSS injection

---

### Task 1: Shared Dashboard UI Layer

**Files:**
- Create: `src/dashboard/ui.py`
- Modify: `src/dashboard/components/__init__.py`
- Test: `tests/test_dashboard_shell.py`

**Step 1: Write the failing test**

Add a test that asserts a shared page metadata helper exposes sidebar group labels and page labels in display order.

**Step 2: Run test to verify it fails**

Run: `python -m unittest tests.test_dashboard_shell.DashboardShellTests.test_page_sections_group_pages_for_navigation`
Expected: FAIL because the helper does not exist yet.

**Step 3: Write minimal implementation**

Create the UI helper module with:
- CSS injection
- page section metadata
- helper functions for status badges, chips, cards, and result classes

**Step 4: Run test to verify it passes**

Run: `python -m unittest tests.test_dashboard_shell.DashboardShellTests.test_page_sections_group_pages_for_navigation`
Expected: PASS

**Step 5: Commit**

```bash
git add docs/plans/2026-03-30-dashboard-ui-redesign*.md src/dashboard/ui.py src/dashboard/components/__init__.py tests/test_dashboard_shell.py
git commit -m "feat: add shared dashboard ui layer"
```

### Task 2: Prototype-Style App Shell

**Files:**
- Modify: `src/dashboard/app.py`
- Test: `tests/test_dashboard_shell.py`

**Step 1: Write the failing test**

Add a test for league label formatting used by the top bar.

**Step 2: Run test to verify it fails**

Run: `python -m unittest tests.test_dashboard_shell.DashboardShellTests.test_format_league_label_title_cases_identifiers`
Expected: FAIL because the helper does not exist yet.

**Step 3: Write minimal implementation**

Update the app entrypoint to:
- inject global CSS
- render sidebar navigation using grouped page metadata
- render topbar league controls and status actions
- keep session state synchronized with page and league selections

**Step 4: Run test to verify it passes**

Run: `python -m unittest tests.test_dashboard_shell.DashboardShellTests.test_format_league_label_title_cases_identifiers`
Expected: PASS

**Step 5: Commit**

```bash
git add src/dashboard/app.py tests/test_dashboard_shell.py
git commit -m "feat: rebuild dashboard shell"
```

### Task 3: FA Sleeper Report Redesign

**Files:**
- Modify: `src/dashboard/pages/sleeper_report.py`
- Modify: `src/dashboard/components/player_table.py`
- Test: `tests/test_dashboard_shell.py`

**Step 1: Write the failing test**

Add a test for richer prepared player table rows, including display metadata required by the redesigned table.

**Step 2: Run test to verify it fails**

Run: `python -m unittest tests.test_dashboard_shell.DashboardShellTests.test_prepare_player_table_rows_formats_display_columns`
Expected: FAIL because the table helper returns only minimal columns.

**Step 3: Write minimal implementation**

Expand the sleeper report renderer to show:
- metric cards
- filter chips/selectors
- prototype-style data table
- detail summary section

**Step 4: Run test to verify it passes**

Run: `python -m unittest tests.test_dashboard_shell.DashboardShellTests.test_prepare_player_table_rows_formats_display_columns`
Expected: PASS

**Step 5: Commit**

```bash
git add src/dashboard/pages/sleeper_report.py src/dashboard/components/player_table.py tests/test_dashboard_shell.py
git commit -m "feat: redesign sleeper report page"
```

### Task 4: Roster and Matchup Pages

**Files:**
- Modify: `src/dashboard/pages/my_roster.py`
- Modify: `src/dashboard/pages/h2h_matchup.py`
- Modify: `src/dashboard/components/cat_grid.py`
- Test: `tests/test_dashboard_shell.py`

**Step 1: Write the failing test**

Add a test for category grid helpers that map matchup result states to display classes.

**Step 2: Run test to verify it fails**

Run: `python -m unittest tests.test_dashboard_shell.DashboardShellTests.test_matchup_result_class_maps_states`
Expected: FAIL because the helper does not exist yet.

**Step 3: Write minimal implementation**

Render:
- roster cards in a grid layout
- matchup category tiles
- pickup suggestion cards for weak categories

**Step 4: Run test to verify it passes**

Run: `python -m unittest tests.test_dashboard_shell.DashboardShellTests.test_matchup_result_class_maps_states`
Expected: PASS

**Step 5: Commit**

```bash
git add src/dashboard/pages/my_roster.py src/dashboard/pages/h2h_matchup.py src/dashboard/components/cat_grid.py tests/test_dashboard_shell.py
git commit -m "feat: redesign roster and matchup pages"
```

### Task 5: Trade and Explorer Pages

**Files:**
- Modify: `src/dashboard/pages/trade_analyzer.py`
- Modify: `src/dashboard/pages/stat_explorer.py`
- Test: `tests/test_dashboard_shell.py`

**Step 1: Write the failing test**

Add a test for verdict labeling / impact formatting used by the redesigned trade page.

**Step 2: Run test to verify it fails**

Run: `python -m unittest tests.test_dashboard_shell.DashboardShellTests.test_trade_overall_label_matches_score`
Expected: FAIL because display labeling is not centralized yet.

**Step 3: Write minimal implementation**

Render:
- trade comparison shell
- impact table with clear positive/negative emphasis
- stat explorer metric cards and comparison sections

**Step 4: Run test to verify it passes**

Run: `python -m unittest tests.test_dashboard_shell.DashboardShellTests.test_trade_overall_label_matches_score`
Expected: PASS

**Step 5: Commit**

```bash
git add src/dashboard/pages/trade_analyzer.py src/dashboard/pages/stat_explorer.py tests/test_dashboard_shell.py
git commit -m "feat: redesign trade and explorer pages"
```

### Task 6: Verification

**Files:**
- Modify: `src/dashboard/app.py`
- Modify: `src/dashboard/pages/*.py`
- Test: `tests/test_dashboard_shell.py`

**Step 1: Run focused tests**

Run: `python -m unittest tests.test_dashboard_shell -v`
Expected: PASS

**Step 2: Run the app manually**

Run: `python -m streamlit run src/dashboard/app.py`
Expected: the dashboard opens with a left navigation rail, topbar league controls, and all five pages following the prototype visual system.

**Step 3: Fix any issues found and rerun tests**

Repeat the focused verification until tests pass cleanly.

**Step 4: Commit**

```bash
git add docs/plans/2026-03-30-dashboard-ui-redesign*.md src/dashboard/app.py src/dashboard/components/*.py src/dashboard/pages/*.py tests/test_dashboard_shell.py
git commit -m "feat: align dashboard ui with prototype"
```
