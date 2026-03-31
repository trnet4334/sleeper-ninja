# Dashboard UI Redesign Design

**Topic:** Rewrite the Streamlit dashboard UI to match the `prototype` dashboard mockup and design spec.

**Audience:** Future general-purpose fantasy baseball users who need a lightweight but information-dense analysis tool.

**Design Direction:** Keep the prototype's quiet, productized dashboard aesthetic. The interface should feel compact, calm, and operational rather than flashy. The shell, visual hierarchy, and reusable components should look consistent across all five pages so the app can grow into a broader tool without redesigning the foundation.

## Scope

- Rebuild the dashboard shell around a prototype-inspired layout:
  - left navigation rail
  - top league switcher bar
  - page header with filters/actions
  - unified content sections
- Restyle all five dashboard pages to follow the `prototype/ui_design_spec.md` layout patterns.
- Preserve the existing Python view-model logic where possible so tests remain focused on data shaping, not presentation.

## Visual System

- Primary accent: `#BA7517`
- Positive state: `#3B6D11`
- Negative state: `#A32D2D`
- Warning state: `#EF9F27`
- Surface styling:
  - subtle borders
  - low-contrast neutral cards
  - compact spacing
  - small uppercase section labels
- Reusable UI elements:
  - metric cards
  - chips
  - badges
  - compact roster cards
  - matchup category tiles
  - table shell with zebra/hover treatment

## Page-by-Page Layout

### FA Sleeper Report

- Four metric cards at the top.
- Compact filter row for player type, time window, and category focus.
- Main ranked table styled to resemble the prototype.
- Detail section below the table for selected player context.

### My Roster

- Three-column roster card grid on wide layouts.
- Each card shows:
  - player name
  - position badge
  - injury status
  - trend arrow
  - games left / schedule label
  - watch or drop recommendation

### H2H Matchup

- Header shows opponent and projection mode.
- Category forecast appears in a compact colored grid.
- Weak-category summary and pickup suggestion cards sit beneath it.

### Trade Analyzer

- Two-column send/receive input summary area.
- Impact table with plus/minus category changes.
- Verdict card with favorable / neutral / unfavorable state.

### Stat Explorer

- Player selector area with optional comparison.
- Metric cards for key stats.
- Structured comparison table and trend/radar placeholder sections for future charting.

## Implementation Constraints

- Use Streamlit-native layout primitives plus targeted CSS injection.
- Avoid overcommitting to fully custom HTML interactions that would fight Streamlit state management.
- Optimize for desktop and wide-screen use, consistent with the prototype spec.
- Keep page logic testable through pure Python view-model helpers.
