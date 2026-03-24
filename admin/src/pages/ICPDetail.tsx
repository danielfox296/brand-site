import { useState, useEffect, useCallback, type KeyboardEvent } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { ICP } from '../types/icp';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LIFE_STAGE_OPTIONS = ['Early career', 'Established', 'Raising children', 'Post-children', 'Retired'];
const FORMATION_ERA_OPTIONS = ['1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];
const CAPITAL_OPTIONS = ['High', 'Upper-Middle', 'Middle', 'Lower-Middle'];
const CULTURAL_CAPITAL_OPTIONS = ['High', 'Upper-Middle', 'Middle', 'Lower'];
const ASPIRATION_OPTIONS = ['Ascending', 'Arrived', 'Maintaining', 'Declining'];
const URBAN_RURAL_OPTIONS = ['Dense Urban', 'Suburban', 'Small Town', 'Rural'];
const GENRE_FAMILIARITY_OPTIONS = ['High', 'Moderate', 'Low'];
const PRIMARY_STATE_OPTIONS = [
  'Wistfulness',
  'Desire',
  'Intimacy/Trust',
  'Activation',
  'Transcendence',
  'Self-Recognition',
];

// ---------------------------------------------------------------------------
// Form state type — mirrors ICP but with mutable primitives
// ---------------------------------------------------------------------------

interface FormData {
  label: string;
  age_range_low: number | null;
  age_range_high: number | null;
  life_stage: string;
  income_range: string;
  formation_era: string;
  economic_capital: string;
  cultural_capital: string;
  aspiration_direction: string;
  urban_rural: string;
  genre_familiarity: string;
  values: string[];
  aesthetic: string;
  purchase_behavior: string;
  music_affinities: string[];
  music_aversions: string[];
  primary_state: string;
  secondary_state: string;
  arousal_target: number;
  valence_target: number;
  emotional_promise: string;
  notes: string;
}

const emptyForm: FormData = {
  label: '',
  age_range_low: null,
  age_range_high: null,
  life_stage: '',
  income_range: '',
  formation_era: '',
  economic_capital: '',
  cultural_capital: '',
  aspiration_direction: '',
  urban_rural: '',
  genre_familiarity: '',
  values: [],
  aesthetic: '',
  purchase_behavior: '',
  music_affinities: [],
  music_aversions: [],
  primary_state: '',
  secondary_state: '',
  arousal_target: 50,
  valence_target: 50,
  emotional_promise: '',
  notes: '',
};

// ---------------------------------------------------------------------------
// Tag Input component
// ---------------------------------------------------------------------------

function TagInput({
  tags,
  onChange,
  placeholder,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState('');

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = input.trim();
      if (val && !tags.includes(val)) {
        onChange([...tags, val]);
      }
      setInput('');
    }
  };

  const remove = (idx: number) => {
    onChange(tags.filter((_, i) => i !== idx));
  };

  return (
    <div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#1e1e1e] border border-[#2a2a2a] text-sm text-white"
            >
              {tag}
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-[#666] hover:text-red-400 transition-colors ml-0.5"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder ?? 'Type and press Enter'}
        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#d7af74]/50 transition-colors"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Collapsible section card
// ---------------------------------------------------------------------------

function Section({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-[#1a1a1a] transition-colors"
      >
        <span className="text-sm font-medium text-white">{title}</span>
        <svg
          className={`w-4 h-4 text-[#666] transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-5 pb-5 pt-1 border-t border-[#2a2a2a]">{children}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared form primitives
// ---------------------------------------------------------------------------

const labelClass = 'block text-xs font-medium text-[#a0a0a0] mb-1';
const inputClass =
  'w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#d7af74]/50 transition-colors';
const selectClass =
  'w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d7af74]/50 transition-colors appearance-none';

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select...',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={selectClass}>
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ICPDetail() {
  const { pilotId, icpId } = useParams<{ pilotId: string; icpId: string }>();
  const navigate = useNavigate();
  const isNew = icpId === 'new';

  const [form, setForm] = useState<FormData>({ ...emptyForm });
  const [pilotName, setPilotName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---- helpers ----

  const set = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  // ---- load data ----

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Fetch pilot name
        if (pilotId) {
          const { data: pilot } = await supabase
            .from('pilots')
            .select('name')
            .eq('id', pilotId)
            .single();
          if (pilot) setPilotName(pilot.name);
        }

        // Fetch ICP if editing
        if (!isNew && icpId) {
          const { data, error: fetchErr } = await supabase
            .from('icps')
            .select('*')
            .eq('id', icpId)
            .single();
          if (fetchErr) throw fetchErr;
          if (data) {
            const icp = data as ICP;
            setForm({
              label: icp.label,
              age_range_low: icp.age_range_low,
              age_range_high: icp.age_range_high,
              life_stage: icp.life_stage ?? '',
              income_range: icp.income_range ?? '',
              formation_era: icp.formation_era ?? '',
              economic_capital: icp.economic_capital ?? '',
              cultural_capital: icp.cultural_capital ?? '',
              aspiration_direction: icp.aspiration_direction ?? '',
              urban_rural: icp.urban_rural ?? '',
              genre_familiarity: icp.genre_familiarity ?? '',
              values: icp.values ?? [],
              aesthetic: icp.aesthetic ?? '',
              purchase_behavior: icp.purchase_behavior ?? '',
              music_affinities: icp.music_affinities ?? [],
              music_aversions: icp.music_aversions ?? [],
              primary_state: icp.primary_state ?? '',
              secondary_state: icp.secondary_state ?? '',
              arousal_target: icp.arousal_target ?? 50,
              valence_target: icp.valence_target ?? 50,
              emotional_promise: icp.emotional_promise ?? '',
              notes: icp.notes ?? '',
            });
          }
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [pilotId, icpId, isNew]);

  // ---- save ----

  const handleSave = async () => {
    if (!form.label.trim()) {
      setError('Label is required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        pilot_id: pilotId!,
        label: form.label.trim(),
        age_range_low: form.age_range_low,
        age_range_high: form.age_range_high,
        life_stage: form.life_stage || null,
        income_range: form.income_range || null,
        formation_era: form.formation_era || null,
        economic_capital: form.economic_capital || null,
        cultural_capital: form.cultural_capital || null,
        aspiration_direction: form.aspiration_direction || null,
        urban_rural: form.urban_rural || null,
        genre_familiarity: form.genre_familiarity || null,
        values: form.values,
        aesthetic: form.aesthetic || null,
        purchase_behavior: form.purchase_behavior || null,
        music_affinities: form.music_affinities,
        music_aversions: form.music_aversions,
        primary_state: form.primary_state || null,
        secondary_state: form.secondary_state || null,
        arousal_target: form.arousal_target,
        valence_target: form.valence_target,
        emotional_promise: form.emotional_promise || null,
        notes: form.notes || null,
      };

      if (isNew) {
        const { error: insertErr } = await supabase.from('icps').insert(payload);
        if (insertErr) throw insertErr;
      } else {
        const { error: updateErr } = await supabase.from('icps').update(payload).eq('id', icpId!);
        if (updateErr) throw updateErr;
      }

      navigate(`/pilots/${pilotId}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // ---- delete ----

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    setError(null);
    try {
      const { error: delErr } = await supabase.from('icps').delete().eq('id', icpId!);
      if (delErr) throw delErr;
      navigate(`/pilots/${pilotId}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  // ---- loading / error states ----

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-5 h-5 border-2 border-[#d7af74] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ---- render ----

  return (
    <div className="max-w-4xl mx-auto pb-28">
      {/* ---- Header ---- */}
      <div className="mb-6">
        <Link
          to={`/pilots/${pilotId}`}
          className="text-sm text-[#a0a0a0] hover:text-white transition-colors inline-flex items-center gap-1.5 mb-3"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Pilot
        </Link>
        <h1 className="text-xl font-semibold text-white">
          {isNew ? 'New ICP Profile' : form.label || 'ICP Profile'}
        </h1>
        {pilotName && <p className="text-sm text-[#666] mt-1">{pilotName}</p>}
      </div>

      {/* ---- Error banner ---- */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-red-300">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* ---- Form sections ---- */}
      <div className="space-y-4">
        {/* ======== Section 1: Demographics ======== */}
        <Section title="Demographics">
          <div className="space-y-4">
            <div>
              <label className={labelClass}>
                Label <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.label}
                onChange={(e) => set('label', e.target.value)}
                placeholder="e.g. Aspirational Suburban Mom"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Age Range Low</label>
                <input
                  type="number"
                  value={form.age_range_low ?? ''}
                  onChange={(e) => set('age_range_low', e.target.value ? Number(e.target.value) : null)}
                  placeholder="18"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Age Range High</label>
                <input
                  type="number"
                  value={form.age_range_high ?? ''}
                  onChange={(e) => set('age_range_high', e.target.value ? Number(e.target.value) : null)}
                  placeholder="35"
                  className={inputClass}
                />
              </div>
            </div>

            <SelectField
              label="Life Stage"
              value={form.life_stage}
              onChange={(v) => set('life_stage', v)}
              options={LIFE_STAGE_OPTIONS}
            />

            <div>
              <label className={labelClass}>Income Range</label>
              <input
                type="text"
                value={form.income_range}
                onChange={(e) => set('income_range', e.target.value)}
                placeholder="e.g. $75k-$120k"
                className={inputClass}
              />
            </div>
          </div>
        </Section>

        {/* ======== Section 2: Six Listener Variables ======== */}
        <Section title="The Six Listener Variables">
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Formation Era"
              value={form.formation_era}
              onChange={(v) => set('formation_era', v)}
              options={FORMATION_ERA_OPTIONS}
            />
            <SelectField
              label="Economic Capital"
              value={form.economic_capital}
              onChange={(v) => set('economic_capital', v)}
              options={CAPITAL_OPTIONS}
            />
            <SelectField
              label="Cultural Capital"
              value={form.cultural_capital}
              onChange={(v) => set('cultural_capital', v)}
              options={CULTURAL_CAPITAL_OPTIONS}
            />
            <SelectField
              label="Aspiration Direction"
              value={form.aspiration_direction}
              onChange={(v) => set('aspiration_direction', v)}
              options={ASPIRATION_OPTIONS}
            />
            <SelectField
              label="Urban/Rural Formation"
              value={form.urban_rural}
              onChange={(v) => set('urban_rural', v)}
              options={URBAN_RURAL_OPTIONS}
            />
            <SelectField
              label="Genre Familiarity"
              value={form.genre_familiarity}
              onChange={(v) => set('genre_familiarity', v)}
              options={GENRE_FAMILIARITY_OPTIONS}
            />
          </div>
        </Section>

        {/* ======== Section 3: Psychographic Detail ======== */}
        <Section title="Psychographic Detail">
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Values</label>
              <TagInput
                tags={form.values}
                onChange={(v) => set('values', v)}
                placeholder="Type a value and press Enter"
              />
            </div>

            <div>
              <label className={labelClass}>Aesthetic</label>
              <input
                type="text"
                value={form.aesthetic}
                onChange={(e) => set('aesthetic', e.target.value)}
                placeholder="e.g. Warm analog, vintage"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Purchase Behavior</label>
              <textarea
                value={form.purchase_behavior}
                onChange={(e) => set('purchase_behavior', e.target.value)}
                placeholder="Describe purchase patterns and behaviors..."
                rows={3}
                className={inputClass + ' resize-y'}
              />
            </div>

            <div>
              <label className={labelClass}>Music Affinities</label>
              <TagInput
                tags={form.music_affinities}
                onChange={(v) => set('music_affinities', v)}
                placeholder="Type an affinity and press Enter"
              />
            </div>

            <div>
              <label className={labelClass}>Music Aversions</label>
              <TagInput
                tags={form.music_aversions}
                onChange={(v) => set('music_aversions', v)}
                placeholder="Type an aversion and press Enter"
              />
            </div>
          </div>
        </Section>

        {/* ======== Section 4: Emotional Targets ======== */}
        <Section title="Emotional Targets">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <SelectField
                label="Primary State"
                value={form.primary_state}
                onChange={(v) => set('primary_state', v)}
                options={PRIMARY_STATE_OPTIONS}
              />
              <div>
                <label className={labelClass}>Secondary State / Arc</label>
                <input
                  type="text"
                  value={form.secondary_state}
                  onChange={(e) => set('secondary_state', e.target.value)}
                  placeholder='e.g. Desire → Trust'
                  className={inputClass}
                />
              </div>
            </div>

            {/* Arousal slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={labelClass + ' mb-0'}>Arousal Target</label>
                <span className="text-xs font-mono text-[#d7af74]">{form.arousal_target}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={form.arousal_target}
                onChange={(e) => set('arousal_target', Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none bg-[#2a2a2a] accent-[#d7af74] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#555] mt-0.5">
                <span>0 — Low</span>
                <span>100 — High</span>
              </div>
            </div>

            {/* Valence slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className={labelClass + ' mb-0'}>Valence Target</label>
                <span className="text-xs font-mono text-[#d7af74]">{form.valence_target}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={form.valence_target}
                onChange={(e) => set('valence_target', Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none bg-[#2a2a2a] accent-[#d7af74] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#555] mt-0.5">
                <span>0 — Negative</span>
                <span>100 — Positive</span>
              </div>
            </div>

            <div>
              <label className={labelClass}>Emotional Promise</label>
              <input
                type="text"
                value={form.emotional_promise}
                onChange={(e) => set('emotional_promise', e.target.value)}
                placeholder='e.g. "Like they found something"'
                className={inputClass}
              />
            </div>
          </div>
        </Section>

        {/* ======== Section 5: Notes ======== */}
        <Section title="Notes">
          <textarea
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Freeform notes about this ICP..."
            rows={5}
            className={inputClass + ' resize-y'}
          />
        </Section>
      </div>

      {/* ---- Sticky action bar ---- */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#2a2a2a] bg-[#0a0a0a]/95 backdrop-blur">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            {!isNew && (
              <>
                {confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-red-400">Are you sure?</span>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="px-3 py-1.5 rounded text-sm font-medium bg-red-600 text-white hover:bg-red-500 transition-colors disabled:opacity-50"
                    >
                      {deleting ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-3 py-1.5 rounded text-sm text-[#a0a0a0] hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-3 py-1.5 rounded text-sm font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isNew && (
              <button
                type="button"
                onClick={() => navigate(`/prompts?icp=${icpId}`)}
                className="px-4 py-1.5 rounded text-sm font-medium text-[#d7af74] border border-[#d7af74]/30 hover:bg-[#d7af74]/10 transition-colors"
              >
                Generate Prompt
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-1.5 rounded text-sm font-medium bg-[#d7af74] text-black hover:bg-[#c9a060] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
