-- Entuned Admin Dashboard: Initial Schema
-- Migration 001
-- Note: "tracks" table already exists from the player app — we ALTER it to add admin columns.

-- ============================================================
-- PILOTS
-- ============================================================
CREATE TABLE IF NOT EXISTS pilots (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'prospect'
              CHECK (status IN ('prospect', 'onboarding', 'active', 'completed', 'churned')),
  start_date  DATE,
  end_date    DATE,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE pilots IS 'Brand pilot programs — each row is a client engagement.';

-- ============================================================
-- CONTACTS
-- ============================================================
CREATE TABLE IF NOT EXISTS contacts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pilot_id    UUID REFERENCES pilots(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  role        TEXT,
  email       TEXT,
  phone       TEXT,
  is_primary  BOOLEAN DEFAULT false,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE contacts IS 'People associated with a pilot.';

-- ============================================================
-- ICPS  (Ideal Customer Profiles / Listener Profiles)
-- ============================================================
CREATE TABLE IF NOT EXISTS icps (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pilot_id             UUID REFERENCES pilots(id) ON DELETE CASCADE,
  label                TEXT NOT NULL,
  age_range_low        INT,
  age_range_high       INT,
  life_stage           TEXT,
  income_range         TEXT,
  formation_era        TEXT,
  economic_capital     TEXT,
  cultural_capital     TEXT,
  aspiration_direction TEXT,
  urban_rural          TEXT,
  genre_familiarity    TEXT,
  values               TEXT[],
  aesthetic            TEXT,
  purchase_behavior    TEXT,
  music_affinities     TEXT[],
  music_aversions      TEXT[],
  primary_state        TEXT,
  secondary_state      TEXT,
  arousal_target       INT,
  valence_target       INT,
  emotional_promise    TEXT,
  notes                TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE icps IS 'Ideal Customer / Listener Profiles for music generation.';

-- ============================================================
-- TRACKS — add admin columns to existing player table
-- ============================================================
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS pilot_id          UUID REFERENCES pilots(id) ON DELETE CASCADE;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS icp_id            UUID REFERENCES icps(id) ON DELETE SET NULL;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS file_url          TEXT;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS duration_seconds  INT;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS generation_model  TEXT;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS generation_prompt TEXT;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS status            TEXT DEFAULT 'review';
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS rating            INT;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS rejection_reason  TEXT;
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS tags              TEXT[];
ALTER TABLE tracks ADD COLUMN IF NOT EXISTS notes             TEXT;

-- ============================================================
-- PLAYLISTS
-- ============================================================
CREATE TABLE IF NOT EXISTS playlists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pilot_id    UUID REFERENCES pilots(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'draft'
              CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE playlists IS 'Curated playlists assembled from tracks.';

-- ============================================================
-- PLAYLIST_TRACKS  (join table)
-- ============================================================
CREATE TABLE IF NOT EXISTS playlist_tracks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  track_id    UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  position    INT NOT NULL,
  added_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (playlist_id, track_id)
);

COMMENT ON TABLE playlist_tracks IS 'Join table linking tracks to playlists with ordering.';

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_contacts_pilot_id        ON contacts(pilot_id);
CREATE INDEX IF NOT EXISTS idx_icps_pilot_id            ON icps(pilot_id);
CREATE INDEX IF NOT EXISTS idx_tracks_pilot_id          ON tracks(pilot_id);
CREATE INDEX IF NOT EXISTS idx_tracks_icp_id            ON tracks(icp_id);
CREATE INDEX IF NOT EXISTS idx_playlists_pilot_id       ON playlists(pilot_id);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_playlist ON playlist_tracks(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_track    ON playlist_tracks(track_id);

-- ============================================================
-- updated_at trigger
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER trg_pilots_updated_at BEFORE UPDATE ON pilots FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_icps_updated_at BEFORE UPDATE ON icps FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_playlists_updated_at BEFORE UPDATE ON playlists FOR EACH ROW EXECUTE FUNCTION set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
