import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Pilot } from '../types/pilot';

interface PilotState {
  pilots: Pilot[];
  loading: boolean;
  error: string | null;
  fetchPilots: () => Promise<void>;
}

export const usePilotStore = create<PilotState>((set) => ({
  pilots: [],
  loading: false,
  error: null,
  fetchPilots: async () => {
    set({ loading: true, error: null });
    const { data, error } = await supabase
      .from('pilots')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      set({ error: error.message, loading: false });
    } else {
      set({ pilots: data || [], loading: false });
    }
  },
}));
