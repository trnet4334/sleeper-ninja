-- ---------------------------------------------------------------------------
-- v4 source tables (Layer 1: shared static data, written by GitHub Actions)
-- ---------------------------------------------------------------------------

create table if not exists statcast_batters (
  player_id    text         not null,
  days_back    int          not null,   -- 7 / 14 / 30
  primary key (player_id, days_back),
  player_name  text         not null,
  team         text,
  position     text,
  pa           int,
  -- Statcast expected stats
  xba          float,
  xslg         float,
  xwoba        float,
  barrel_pct   float,
  hard_hit_pct float,
  ev_avg       float,
  sprint_speed float,
  -- Traditional counting / rate stats
  avg          float,
  obp          float,
  hr           int,
  sb           int,
  tb           int,
  bb           int,
  k_pct        float,
  bb_pct       float,
  updated_at   timestamptz  default now()
);

create table if not exists statcast_pitchers (
  player_id     text         not null,
  days_back     int          not null,  -- 7 / 14 / 30
  primary key (player_id, days_back),
  player_name   text         not null,
  team          text,
  role          text,                   -- SP / RP / CL
  ip            float,
  -- Statcast expected stats
  xera          float,
  xfip          float,
  xwoba_against float,
  swstr_pct     float,
  csw_pct       float,
  k_pct         float,
  bb_pct        float,
  -- Traditional counting stats
  era           float,
  whip          float,
  k             int,
  w             int,
  sv            int,
  hld           int,
  updated_at    timestamptz  default now()
);

create table if not exists projections (
  player_id   text primary key,
  player_name text,
  season      int,
  -- Hitting projections (Steamer)
  pa          int,
  hr          float,
  r           float,
  rbi         float,
  sb          float,
  avg         float,
  obp         float,
  slg         float,
  tb          float,
  bb          float,
  -- Pitching projections (Steamer)
  w           float,
  sv          float,
  k           float,
  era         float,
  whip        float,
  ip          float,
  updated_at  timestamptz default now()
);

create table if not exists adp (
  player_id   text primary key,
  player_name text,
  position    text,
  adp         float,
  updated_at  timestamptz default now()
);

create table if not exists injuries (
  player_id   text         not null,
  date        date         not null,
  primary key (player_id, date),
  player_name text,
  team        text,
  il_type     text,
  description text,
  updated_at  timestamptz  default now()
);

-- ---------------------------------------------------------------------------
-- Deprecated tables (kept for backwards compatibility, do not write new data)
-- ---------------------------------------------------------------------------

-- DEPRECATED: replaced by statcast_batters / statcast_pitchers
create table if not exists statcast_daily (
  player_id text primary key,
  player_name text,
  team text,
  date_range text,
  xwoba float,
  xera float,
  barrel_pct float,
  swstr_pct float,
  updated_at timestamp default now()
);

-- DEPRECATED: replaced by injuries
create table if not exists injuries_and_status (
  player_id text primary key,
  player_name text,
  team text,
  il_type text,
  status text,
  updated_at timestamp default now()
);

-- DEPRECATED: replaced by adp
create table if not exists market_adp (
  player_id text primary key,
  player_name text,
  adp float,
  source text,
  updated_at timestamp default now()
);

-- DEPRECATED: flat snapshot replaced by statcast_batters / statcast_pitchers
-- kept while api/_shared/supabase.ts migration is in progress
create table if not exists players (
  player_id         text primary key,
  player_name       text not null,
  team              text,
  position          text,
  player_type       text,
  roster_state      text default 'waiver',
  season            int,
  avg               float,
  obp               float,
  slg               float,
  hr                int,
  sb                int,
  tb                int,
  bb                int,
  era               float,
  whip              float,
  strikeouts        int,
  qs                int,
  wins              int,
  saves             int,
  holds             int,
  xba               float,
  xwoba             float,
  xslg              float,
  xera              float,
  xfip              float,
  barrel_pct        float,
  hard_hit_pct      float,
  sprint_speed      float,
  ev                float,
  swstr_pct         float,
  csw_pct           float,
  k_pct             float,
  bb_pct            float,
  trend             float[],
  delta             float,
  recommendation_score int,
  updated_at        timestamp default now()
);

-- yahoo_tokens table removed in yahoo-oauth-cookie change
-- tokens are now stored exclusively in browser httpOnly cookies
