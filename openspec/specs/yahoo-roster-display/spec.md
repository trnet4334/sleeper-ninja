# yahoo-roster-display Specification

## Purpose
Defines requirements for fetching and displaying real Yahoo Fantasy roster data on the My Roster page, including the API endpoint, frontend hook, IL player distinction, and stat column placeholder behavior.

## Requirements

### Requirement: API returns real Yahoo roster for authenticated user's team
The system SHALL fetch the authenticated user's team roster from Yahoo Fantasy API for the given Yahoo league ID, returning player name, MLB team, primary position, selected fantasy position, and injury status for each rostered player.

#### Scenario: Roster returned for valid league
- **WHEN** `GET /api/yahoo/roster?league_id=<yahooLeagueId>` is called with a valid Yahoo cookie
- **THEN** the response contains `{ status: "ok", leagueId, roster: YahooPlayer[] }` where each player has `playerName`, `team`, `position`, `selectedPosition`, and `status`

#### Scenario: User has no team in league
- **WHEN** the Yahoo API finds no team owned by the authenticated user in the specified league
- **THEN** the endpoint returns `{ status: "no_team" }` with HTTP 404

#### Scenario: Token refreshed transparently
- **WHEN** the Yahoo token is expired at request time
- **THEN** the system refreshes the token before fetching roster data and returns the updated Set-Cookie header alongside the roster response

### Requirement: My Roster page uses Yahoo roster hook to display real players
The system SHALL provide a `useYahooRoster` hook that fetches roster data from `/api/yahoo/roster` and returns hitters and pitchers as separate arrays compatible with `PlayerRow`.

#### Scenario: Hook returns hitters and pitchers split
- **WHEN** `useYahooRoster(yahooLeagueId)` is called with a non-empty league ID
- **THEN** it returns `{ hitters: YahooPlayer[], pitchers: YahooPlayer[], loading: boolean }` where pitchers are players whose primary position includes SP, RP, or P

#### Scenario: Hook returns empty arrays while loading
- **WHEN** `useYahooRoster` is fetching
- **THEN** `loading` is `true` and both `hitters` and `pitchers` are empty arrays

#### Scenario: Hook returns empty arrays on error
- **WHEN** the `/api/yahoo/roster` call fails (non-2xx or network error)
- **THEN** `loading` is `false` and both arrays are empty

### Requirement: IL players are visually distinguished in the roster table
The system SHALL render players assigned to the fantasy IL slot (`selected_position` is `"IL"`, `"IL10"`, or `"IL60"`) with the existing `il` prop on `PlayerRow`, producing reduced opacity and an IL badge.

#### Scenario: IL player row dimmed
- **WHEN** a rostered player has `selectedPosition` of `"IL"` or `"IL10"` or `"IL60"`
- **THEN** `PlayerRow` renders with `il={true}`, showing reduced opacity and a rose-colored IL badge

#### Scenario: Active player row normal
- **WHEN** a rostered player's `selectedPosition` is not an IL variant
- **THEN** `PlayerRow` renders with `il={false}`, showing an emerald Active badge

### Requirement: Stat columns show placeholder dashes for Yahoo-sourced roster players
The system SHALL render `"–"` in all stat columns (AVG, HR, RBI, SB, ERA, WHIP, K, W-S) for Yahoo roster players, since per-player stats are not included in the Yahoo roster endpoint response.

#### Scenario: Stat cells show dash
- **WHEN** the My Roster page displays a Yahoo-fetched player
- **THEN** every stat column cell shows `"–"` instead of a numeric value
