import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Track, Playlist } from '../types/music';

interface MusicState {
  tracks: Track[];
  playlists: Playlist[];
  loading: boolean;
  error: string | null;
  fetchTracks: () => Promise<void>;
  fetchPlaylists: () => Promise<void>;
}

export const useMusicStore = create<MusicState>((set) => ({
  tracks: [],
  playlists: [],
  loading: false,
  error: null,
  fetchTracks: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      set({ error: error.message, loading: false });
    } else {
      set({ tracks: data || [], loading: false });
    }
  },
  fetchPlaylists: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('playlists')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      set({ error: error.message, loading: false });
    } else {
      set({ playlists: data || [], loading: false });
    }
  },
}));
