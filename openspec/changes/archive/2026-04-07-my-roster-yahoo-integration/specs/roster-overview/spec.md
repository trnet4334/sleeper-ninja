## MODIFIED Requirements

### Requirement: Page auto-imports Yahoo leagues when connected and no leagues exist
The page SHALL detect when Yahoo OAuth is connected and no leagues exist in localStorage, then automatically fetch and import the user's Yahoo leagues without requiring manual entry via the Add League form.

#### Scenario: Auto-import on first visit after Yahoo connect
- **WHEN** the My Roster page mounts with Yahoo connected and `leagues.length === 0`
- **THEN** the system fetches leagues from `/api/yahoo/leagues`, adds each result via `addLeague`, and renders the roster content for the first imported league

#### Scenario: Loading state during auto-import
- **WHEN** the auto-import fetch is in progress
- **THEN** the page shows a loading skeleton or spinner instead of the Add League form

#### Scenario: No leagues found on Yahoo account
- **WHEN** Yahoo is connected but `/api/yahoo/leagues` returns an empty array
- **THEN** the Add League form is shown so the user can add a league manually

#### Scenario: Yahoo not connected — form shown as before
- **WHEN** Yahoo is not connected and `leagues.length === 0`
- **THEN** the Add League form is shown (no auto-import attempted)

## ADDED Requirements

### Requirement: Roster content uses Yahoo roster data when active league has a Yahoo league ID
The page SHALL use `useYahooRoster` to populate the hitter and pitcher tables when the active league has a non-empty `yahooLeagueId`, replacing the static `useRosterData` hook.

#### Scenario: Yahoo-backed league shows real roster
- **WHEN** the active league has a `yahooLeagueId` and the user navigates to My Roster
- **THEN** the hitter and pitcher tables are populated with players returned from `useYahooRoster`

#### Scenario: No yahooLeagueId — tables show empty state
- **WHEN** the active league has an empty `yahooLeagueId`
- **THEN** the tables show the empty-state message ("No players on roster.")
