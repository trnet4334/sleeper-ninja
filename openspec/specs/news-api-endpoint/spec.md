### Requirement: Serve news data via API route
The system SHALL expose a Vercel serverless function at `api/news.ts` that accepts `?type=prospects|injuries`, optional `?days=` (default 7 for prospects, 14 for injuries), and optional `?cats=` (comma-separated category filter), and returns a JSON response with `items`, `updatedAt`, and `source` fields.

#### Scenario: Prospects request
- **WHEN** `GET /api/news?type=prospects` is called
- **THEN** the response contains `items` from `player_news` filtered to `categories` overlapping `['prospect', 'recalled', 'promoted', 'optioned', 'debut']`, ordered by `published_at DESC`

#### Scenario: Injuries request
- **WHEN** `GET /api/news?type=injuries` is called
- **THEN** the response contains `items` from `player_transactions` filtered to `categories` overlapping `['injury', 'return']`, ordered by `date DESC`

#### Scenario: Missing type param
- **WHEN** `GET /api/news` is called without `?type=`
- **THEN** the response is `400 Bad Request` with `{ error: "type must be prospects or injuries" }`

### Requirement: Supabase → local JSON fallback
The API route SHALL follow the existing three-level fallback pattern: Supabase first, then `public/exports/player_news.json` or `player_transactions.json`, then empty array.

#### Scenario: Supabase unavailable
- **WHEN** Supabase env vars are missing or the query fails
- **THEN** the route reads the local JSON export file and returns its contents

#### Scenario: Local JSON also missing
- **WHEN** both Supabase and local JSON are unavailable
- **THEN** the route returns `{ items: [], updatedAt: null, source: [] }` with status 200
