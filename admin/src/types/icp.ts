export interface ICP {
  id: string;
  pilot_id: string;
  label: string;
  age_range_low: number | null;
  age_range_high: number | null;
  life_stage: string | null;
  income_range: string | null;
  formation_era: string | null;
  economic_capital: string | null;
  cultural_capital: string | null;
  aspiration_direction: string | null;
  urban_rural: string | null;
  genre_familiarity: string | null;
  values: string[];
  aesthetic: string | null;
  purchase_behavior: string | null;
  music_affinities: string[];
  music_aversions: string[];
  primary_state: string | null;
  secondary_state: string | null;
  arousal_target: number | null;
  valence_target: number | null;
  emotional_promise: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
