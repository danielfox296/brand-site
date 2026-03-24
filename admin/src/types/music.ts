export interface Track {
  id: string;
  pilot_id: string | null;
  icp_id: string | null;
  title: string;
  file_url: string | null;
  duration_seconds: number | null;
  generation_model: string | null;
  generation_prompt: string | null;
  status: 'review' | 'approved' | 'rejected' | 'archived';
  rating: number | null;
  rejection_reason: string | null;
  tags: string[];
  notes: string | null;
  created_at: string;
}

export interface Playlist {
  id: string;
  pilot_id: string | null;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlaylistTrack {
  id: string;
  playlist_id: string;
  track_id: string;
  position: number;
  added_at: string;
}
