## ADDED Requirements

### Requirement: News step in fetch_all pipeline
`scripts/fetch_all.py` SHALL include a `news` step that runs after `adp` and before `scoring`, calling `scripts/news.py`'s `run()` function. The step result is logged in the same format as other pipeline steps.

#### Scenario: News step runs in sequence
- **WHEN** `fetch_all.py` is executed
- **THEN** the pipeline runs: savant → mlb_stats → fangraphs → adp → news → backfill → scoring

#### Scenario: News step failure is non-fatal
- **WHEN** `news.run()` raises an exception (e.g. network error)
- **THEN** the exception is caught, logged with `[news] error: ...`, and the pipeline continues to the next step
