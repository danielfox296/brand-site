-- Entuned Admin Dashboard: Initial Schema
-- Migration 001

-- ============================================================
-- PILOTS
-- ============================================================
CREATE TABLE pilots (
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

COMMENT ON TABLE pilots IS 'Brand pilot programs — each row is a client engagement moving through prospect -> onboarding -> active -> completed/churned.';

-- ============================================================
-- CONTACTS
-- ============================================================
CREATE TABLE contacts (
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

COMMENT ON TABLE contacts IS 'People associated with a pilot — stakeholders, decision-makers, day-to-day contacts.';

-- ============================================================
-- ICPS  (Ideal Customer Profiles / Listener Profiles)
-- ============================================================
CREATE TABLE icps (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pilot_id             UUID REFERENCES pilots(id) ON DELETE CASCADE,
  label                TEXT NOT NULL,

  -- Demographics
  age_range_low        INT,
  age_range_high       INT,
  life_stage           TEXT,
  income_range         TEXT,

  -- Six Listener Variables
  formation_era        TEXT,
  economic_capital     TEXT,
  cultural_capital     TEXT,
  aspiration_direction TEXT,
  urban_rural          TEXT,
  genre_familiarity    TEXT,

  -- Psychographic
  values               TEXT[],
  aesthetic            TEXT,
  purchase_behavior    TEXT,
  music_affinities     TEXT[],
  music_aversions      TEXT[],

  -- Emotional
  primary_state        TEXT,
  secondary_state      TEXT,
  arousal_target       INT,
  valence_target       INT,
  emotional_promise    TEXT,

  notes                TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE icps IS 'Ideal Customer / Listener Profiles — demographics, psychographics, and emotional targets that guide music generation for a pilot.';

-- ============================================================
-- TRACKS
-- ============================================================
CREATE TABLE tracks (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pilot_id          UUID REFERENCES pilots(id) ON DELETE CASCADE,
  icp_id            UUID REFERENCES icps(id) ON DELETE SET NULL,
  title             TEXT NOT NULL,
  file_url          TEXT,
  duration_seconds  INT,
  generation_model  TEXT,
  generation_prompt TEXT,
  status            TEXT NOT NULL DEFAULT 'review'
                    CHECK (status IN ('review', 'approved', 'rejected')),
  rating            INT,
  rejection_reason  TEXT,
  tags              TEXT[],
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE tracks IS 'Individual music tracks generated or uploaded for a pilot, optionally linked to an ICP.';

-- ============================================================
-- PLAYLISTS
-- ============================================================
CREATE TABLE playlists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pilot_id    UUID REFERENCES pilots(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'draft'
              CHECK (status IN ('draft', 'review', 'published', 'archived')),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE playlists IS 'Curated playlists assembled from tracks, optionally tied to a pilot.';

-- ============================================================
-- PLAYLIST_TRACKS  (join table)
-- ============================================================
CREATE TABLE playlist_tracks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  track_id    UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  position    INT NOT NULL,
  added_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (playlist_id, track_id)
);

COMMENT ON TABLE playlist_tracks IS 'Join table linking tracks to playlists with ordering.';

-- ============================================================
-- INDEXES on foreign keys
-- ============================================================
CREATE INDEX idx_contacts_pilot_id        ON contacts(pilot_id);
CREATE INDEX idx_icps_pilot_id            ON icps(pilot_id);
CREATE INDEX idx_tracks_pilot_id          ON tracks(pilot_id);
CREATE INDEX idx_tracks_icp_id            ON tracks(icp_id);
CREATE INDEX idx_playlists_pilot_id       ON playlists(pilot_id);
CREATE INDEX idx_playlist_tracks_playlist ON playlist_tracks(playlist_id);
CREATE INDEX idx_playlist_tracks_track    ON playlist_tracks(track_id);

-- ============================================================
-- updated_at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER trg_pilots_updated_at
  BEFORE UPDATE ON pilots
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_icps_updated_at
  BEFORE UPDATE ON icps
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_playlists_updated_at
  BEFORE UPDATE ON playlists
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
