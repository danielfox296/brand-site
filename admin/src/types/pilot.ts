export interface Pilot {
  id: string;
  name: string;
  status: 'prospect' | 'onboarding' | 'active' | 'completed' | 'churned';
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  pilot_id: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  is_primary: boolean;
  notes: string | null;
  created_at: string;
}
