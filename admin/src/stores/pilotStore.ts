import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Pilot, Contact } from '../types/pilot';

export interface PilotWithCounts extends Pilot {
  contact_count: number;
  icp_count: number;
  track_count: number;
}

interface PilotState {
  pilots: PilotWithCounts[];
  currentPilot: Pilot | null;
  contacts: Contact[];
  loading: boolean;
  error: string | null;

  // Pilot operations
  fetchPilots: () => Promise<void>;
  fetchPilot: (id: string) => Promise<void>;
  createPilot: (data: Omit<Pilot, 'id' | 'created_at' | 'updated_at'>) => Promise<Pilot | null>;
  updatePilot: (id: string, data: Partial<Omit<Pilot, 'id' | 'created_at' | 'updated_at'>>) => Promise<Pilot | null>;
  deletePilot: (id: string) => Promise<boolean>;

  // Contact operations
  fetchContacts: (pilotId: string) => Promise<void>;
  createContact: (data: Omit<Contact, 'id' | 'created_at'>) => Promise<Contact | null>;
  updateContact: (id: string, data: Partial<Omit<Contact, 'id' | 'created_at'>>) => Promise<Contact | null>;
  deleteContact: (id: string) => Promise<boolean>;
}

export const usePilotStore = create<PilotState>((set, get) => ({
  pilots: [],
  currentPilot: null,
  contacts: [],
  loading: false,
  error: null,

  // ---------------------------------------------------------------------------
  // Pilot operations
  // ---------------------------------------------------------------------------

  fetchPilots: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('pilots')
        .select(`
          *,
          contacts(count),
          icps(count),
          tracks(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const pilots: PilotWithCounts[] = (data || []).map((p: any) => ({
        ...p,
        contact_count: p.contacts?.[0]?.count ?? 0,
        icp_count: p.icps?.[0]?.count ?? 0,
        track_count: p.tracks?.[0]?.count ?? 0,
      }));

      set({ pilots, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  fetchPilot: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('pilots')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      set({ currentPilot: data, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createPilot: async (data) => {
    set({ loading: true, error: null });
    try {
      const { data: pilot, error } = await supabase
        .from('pilots')
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      const pilotWithCounts: PilotWithCounts = {
        ...pilot,
        contact_count: 0,
        icp_count: 0,
        track_count: 0,
      };
      set((state) => ({
        pilots: [pilotWithCounts, ...state.pilots],
        loading: false,
      }));
      return pilot;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  updatePilot: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const { data: pilot, error } = await supabase
        .from('pilots')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        pilots: state.pilots.map((p) =>
          p.id === id ? { ...p, ...pilot } : p
        ),
        currentPilot: state.currentPilot?.id === id ? pilot : state.currentPilot,
        loading: false,
      }));
      return pilot;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  deletePilot: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('pilots')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        pilots: state.pilots.filter((p) => p.id !== id),
        currentPilot: state.currentPilot?.id === id ? null : state.currentPilot,
        loading: false,
      }));
      return true;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return false;
    }
  },

  // ---------------------------------------------------------------------------
  // Contact operations
  // ---------------------------------------------------------------------------

  fetchContacts: async (pilotId: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('pilot_id', pilotId)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      set({ contacts: data ?? [], loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  createContact: async (data) => {
    set({ loading: true, error: null });
    try {
      const { data: contact, error } = await supabase
        .from('contacts')
        .insert(data)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        contacts: [...state.contacts, contact],
        pilots: state.pilots.map((p) =>
          p.id === data.pilot_id
            ? { ...p, contact_count: p.contact_count + 1 }
            : p
        ),
        loading: false,
      }));
      return contact;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  updateContact: async (id, data) => {
    set({ loading: true, error: null });
    try {
      const { data: contact, error } = await supabase
        .from('contacts')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        contacts: state.contacts.map((c) => (c.id === id ? contact : c)),
        loading: false,
      }));
      return contact;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return null;
    }
  },

  deleteContact: async (id) => {
    set({ loading: true, error: null });
    try {
      const contact = get().contacts.find((c) => c.id === id);

      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        contacts: state.contacts.filter((c) => c.id !== id),
        pilots: contact
          ? state.pilots.map((p) =>
              p.id === contact.pilot_id
                ? { ...p, contact_count: Math.max(0, p.contact_count - 1) }
                : p
            )
          : state.pilots,
        loading: false,
      }));
      return true;
    } catch (err: any) {
      set({ error: err.message, loading: false });
      return false;
    }
  },
}));
