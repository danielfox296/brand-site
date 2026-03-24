import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { ICP } from '../types/icp';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Platform = 'ace-step' | 'suno';

interface ICPWithPilot extends ICP {
  pilots?: { name: string } | null;
}

interface FormState {
  bpmMin: number;
  bpmMax: number;
  mode: string;
  keyRegister: string;
  primaryInstruments: string[];
  secondaryInstruments: string[];
  productionEra: string;
  productionCharacter: string;
  genreDescriptors: string[];
  moodDescriptors: string[];
  instrumental: boolean;
  vocalStyle: string;
  lyricalThemes: string[];
  contraindications: string[];
  // ICP-derived (for ACE-Step output)
  primaryState: string;
  arousalTarget: number;
  valenceTarget: number;
}

const INITIAL_FORM: FormState = {
  bpmMin: 90,
  bpmMax: 120,
  mode: 'Major',
  keyRegister: 'Mid',
  primaryInstruments: [],
  secondaryInstruments: [],
  productionEra: '2020s',
  productionCharacter: '',
  genreDescriptors: [],
  moodDescriptors: [],
  instrumental: false,
  vocalStyle: '',
  lyricalThemes: [],
  contraindications: [],
  primaryState: '',
  arousalTarget: 50,
  valenceTarget: 50,
};

const MODES = [
  'Major',
  'Minor',
  'Dorian',
  'Mixolydian',
  'Lydian',
  'Phrygian',
  'Pentatonic Major',
  'Pentatonic Minor',
];

const KEY_REGISTERS = ['Low', 'Mid', 'High'];

const PRODUCTION_ERAS = ['1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];

// ---------------------------------------------------------------------------
// TagInput component
// ---------------------------------------------------------------------------

function TagInput({
  label,
  tags,
  onChange,
  placeholder,
}: {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) {
        onChange([...tags, input.trim()]);
      }
      setInput('');
    }
    if (e.key === 'Backspace' && !input && tags.length) {
      onChange(tags.slice(0, -1));
    }
  };

  const remove = (idx: number) => {
    onChange(tags.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-[#a0a0a0] mb-1.5">{label}</label>
      <div className="flex flex-wrap items-center gap-1.5 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-2 focus-within:border-[#d7af74] transition-colors min-h-[42px]">
        {tags.map((tag, i) => (
          <span
            key={`${tag}-${i}`}
            className="inline-flex items-center gap-1 bg-[#2a2a2a] text-white text-xs px-2.5 py-1 rounded-md"
          >
            {tag}
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-[#a0a0a0] hover:text-white ml-0.5"
            >
              &times;
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? (placeholder ?? 'Type and press Enter') : ''}
          className="flex-1 min-w-[120px] bg-transparent text-white text-sm outline-none placeholder:text-[#555]"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Prompt generators
// ---------------------------------------------------------------------------

function generateSunoPrompt(f: FormState): string {
  const parts: string[] = [];

  if (f.moodDescriptors.length) parts.push(f.moodDescriptors.join(', '));
  parts.push(`${f.bpmMin}-${f.bpmMax} BPM`);
  if (f.genreDescriptors.length) parts.push(f.genreDescriptors.join(', '));
  parts.push(f.mode);
  if (f.primaryInstruments.length) parts.push(f.primaryInstruments.join(', '));
  if (f.secondaryInstruments.length) parts.push(f.secondaryInstruments.join(', '));
  if (f.productionCharacter) parts.push(f.productionCharacter);
  parts.push(f.instrumental ? 'instrumental' : f.vocalStyle || 'vocals');

  let prompt = parts.join(', ');
  if (prompt.length > 200) prompt = prompt.slice(0, 197) + '...';
  return prompt;
}

function generateAceStepPrompt(f: FormState): string {
  const lines: string[] = [];

  const genreStr = f.genreDescriptors.length ? f.genreDescriptors.join(', ') : 'musical';
  lines.push(
    `A ${genreStr} track at ${f.bpmMin}-${f.bpmMax} BPM in ${f.mode} mode, ${f.keyRegister.toLowerCase()} register.`
  );

  const primary = f.primaryInstruments.length ? f.primaryInstruments.join(', ') : 'none specified';
  const secondary = f.secondaryInstruments.length
    ? f.secondaryInstruments.join(', ')
    : 'none specified';
  lines.push(`Primary instrumentation: ${primary}. Secondary: ${secondary}.`);

  lines.push(
    `Production style: ${f.productionEra} era${f.productionCharacter ? `, ${f.productionCharacter}` : ''}.`
  );

  const moodStr = f.moodDescriptors.length ? f.moodDescriptors.join(', ') : 'unspecified';
  const emotionalParts = [`Mood: ${moodStr}.`];
  if (f.primaryState) {
    emotionalParts.push(
      `Emotional target: ${f.primaryState} with ${f.arousalTarget}% arousal and ${f.valenceTarget}% valence.`
    );
  }
  lines.push(emotionalParts.join(' '));

  if (f.instrumental) {
    lines.push('Purely instrumental, no vocals.');
  } else {
    const vocalParts: string[] = [];
    if (f.vocalStyle) vocalParts.push(`Vocals: ${f.vocalStyle}.`);
    if (f.lyricalThemes.length) vocalParts.push(`Lyrical themes: ${f.lyricalThemes.join(', ')}.`);
    if (vocalParts.length) lines.push(vocalParts.join(' '));
  }

  if (f.contraindications.length) {
    lines.push(`Avoid: ${f.contraindications.join(', ')}.`);
  }

  return lines.join('\n\n');
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function PromptGenerator() {
  const [searchParams] = useSearchParams();
  const icpParam = searchParams.get('icp');

  const [platform, setPlatform] = useState<Platform>('ace-step');
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [icps, setIcps] = useState<ICPWithPilot[]>([]);
  const [selectedIcpId, setSelectedIcpId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Fetch all ICPs with pilot name
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('icps')
        .select('*, pilots(name)')
        .order('label');
      if (data) setIcps(data as ICPWithPilot[]);
    })();
  }, []);

  // Pre-fill from query param once ICPs are loaded
  useEffect(() => {
    if (icpParam && icps.length && !selectedIcpId) {
      setSelectedIcpId(icpParam);
    }
  }, [icpParam, icps, selectedIcpId]);

  // Populate form from selected ICP
  const populateFromIcp = useCallback(
    (icpId: string) => {
      const icp = icps.find((i) => i.id === icpId);
      if (!icp) return;

      setForm((prev) => ({
        ...prev,
        moodDescriptors:
          icp.primary_state && icp.secondary_state
            ? [icp.primary_state, icp.secondary_state]
            : icp.primary_state
              ? [icp.primary_state]
              : prev.moodDescriptors,
        primaryState: icp.primary_state ?? prev.primaryState,
        arousalTarget: icp.arousal_target ?? prev.arousalTarget,
        valenceTarget: icp.valence_target ?? prev.valenceTarget,
        productionEra: icp.formation_era ?? prev.productionEra,
        productionCharacter: icp.aesthetic ?? prev.productionCharacter,
        genreDescriptors:
          icp.music_affinities?.length ? icp.music_affinities : prev.genreDescriptors,
        contraindications:
          icp.music_aversions?.length ? icp.music_aversions : prev.contraindications,
      }));
    },
    [icps]
  );

  useEffect(() => {
    if (selectedIcpId) populateFromIcp(selectedIcpId);
  }, [selectedIcpId, populateFromIcp]);

  // Generated prompt (reactive)
  const prompt = useMemo(
    () => (platform === 'suno' ? generateSunoPrompt(form) : generateAceStepPrompt(form)),
    [platform, form]
  );

  // Auto-title from form parameters
  const autoTitle = useMemo(() => {
    const parts: string[] = [];
    if (form.genreDescriptors.length) parts.push(form.genreDescriptors[0]);
    if (form.moodDescriptors.length) parts.push(form.moodDescriptors[0]);
    parts.push(`${form.bpmMin}-${form.bpmMax}bpm`);
    parts.push(form.mode);
    if (form.instrumental) parts.push('Instrumental');
    return parts.join(' - ') || 'Untitled Track';
  }, [form]);

  // Copy handler
  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Show toast
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // Save as track
  const handleSaveTrack = async () => {
    setSaving(true);
    try {
      const selectedIcp = icps.find((i) => i.id === selectedIcpId);
      const { error } = await supabase.from('tracks').insert({
        title: autoTitle,
        generation_prompt: prompt,
        generation_model: platform === 'suno' ? 'Suno V5' : 'ACE-Step 1.5',
        status: 'review',
        pilot_id: selectedIcp?.pilot_id ?? null,
        icp_id: selectedIcp?.id ?? null,
        tags: [...form.genreDescriptors, ...form.moodDescriptors],
      });
      if (error) throw error;
      showToast('Track saved successfully');
    } catch (err) {
      showToast('Error saving track');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Form field updater
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Shared input class
  const inputCls =
    'w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#d7af74] transition-colors placeholder:text-[#555]';
  const selectCls = `${inputCls} appearance-none cursor-pointer`;
  const labelCls = 'block text-sm font-medium text-[#a0a0a0] mb-1.5';

  return (
    <div className="relative">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#1a1a1a] border border-[#2a2a2a] text-white px-5 py-3 rounded-lg shadow-xl text-sm animate-[fadeIn_0.2s_ease-out]">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white">Prompt Generator</h1>
        <p className="text-sm text-[#a0a0a0] mt-1">
          Generate music prompts for AI models
        </p>
      </div>

      {/* Top controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
        {/* Platform toggle */}
        <div className="flex bg-[#141414] border border-[#2a2a2a] rounded-lg p-1">
          <button
            onClick={() => setPlatform('ace-step')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              platform === 'ace-step'
                ? 'bg-[#d7af74] text-black'
                : 'text-[#a0a0a0] hover:text-white'
            }`}
          >
            ACE-Step 1.5
          </button>
          <button
            onClick={() => setPlatform('suno')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              platform === 'suno'
                ? 'bg-[#d7af74] text-black'
                : 'text-[#a0a0a0] hover:text-white'
            }`}
          >
            Suno V5
          </button>
        </div>

        {/* ICP dropdown */}
        <div className="flex-1 max-w-sm">
          <select
            value={selectedIcpId}
            onChange={(e) => setSelectedIcpId(e.target.value)}
            className={selectCls}
          >
            <option value="">Pre-fill from ICP...</option>
            {icps.map((icp) => (
              <option key={icp.id} value={icp.id}>
                {icp.label}
                {icp.pilots?.name ? ` (${icp.pilots.name})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT — Form */}
        <div className="space-y-5">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6 space-y-5">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Musical Parameters
            </h2>

            {/* Tempo / BPM */}
            <div>
              <label className={labelCls}>Tempo / BPM Range</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={form.bpmMin}
                  onChange={(e) => set('bpmMin', Number(e.target.value))}
                  min={20}
                  max={300}
                  className={`${inputCls} w-24`}
                  placeholder="Min"
                />
                <span className="text-[#a0a0a0] text-sm">to</span>
                <input
                  type="number"
                  value={form.bpmMax}
                  onChange={(e) => set('bpmMax', Number(e.target.value))}
                  min={20}
                  max={300}
                  className={`${inputCls} w-24`}
                  placeholder="Max"
                />
                <span className="text-[#555] text-xs">BPM</span>
              </div>
            </div>

            {/* Mode */}
            <div>
              <label className={labelCls}>Mode</label>
              <select
                value={form.mode}
                onChange={(e) => set('mode', e.target.value)}
                className={selectCls}
              >
                {MODES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* Key register */}
            <div>
              <label className={labelCls}>Key Register</label>
              <select
                value={form.keyRegister}
                onChange={(e) => set('keyRegister', e.target.value)}
                className={selectCls}
              >
                {KEY_REGISTERS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Primary instruments */}
            <TagInput
              label="Primary Instruments"
              tags={form.primaryInstruments}
              onChange={(v) => set('primaryInstruments', v)}
              placeholder="e.g. Rhodes piano"
            />

            {/* Secondary instruments */}
            <TagInput
              label="Secondary Instruments"
              tags={form.secondaryInstruments}
              onChange={(v) => set('secondaryInstruments', v)}
              placeholder="e.g. subtle strings"
            />

            {/* Production era */}
            <div>
              <label className={labelCls}>Production Era</label>
              <select
                value={form.productionEra}
                onChange={(e) => set('productionEra', e.target.value)}
                className={selectCls}
              >
                {PRODUCTION_ERAS.map((era) => (
                  <option key={era} value={era}>
                    {era}
                  </option>
                ))}
              </select>
            </div>

            {/* Production character */}
            <div>
              <label className={labelCls}>Production Character</label>
              <input
                type="text"
                value={form.productionCharacter}
                onChange={(e) => set('productionCharacter', e.target.value)}
                placeholder="e.g. Warm, analog, slightly lo-fi"
                className={inputCls}
              />
            </div>

            {/* Genre descriptors */}
            <TagInput
              label="Genre Descriptors"
              tags={form.genreDescriptors}
              onChange={(v) => set('genreDescriptors', v)}
              placeholder="e.g. neo-soul"
            />

            {/* Mood descriptors */}
            <TagInput
              label="Mood Descriptors"
              tags={form.moodDescriptors}
              onChange={(v) => set('moodDescriptors', v)}
              placeholder="e.g. reflective, warm"
            />

            {/* Vocal style / Instrumental toggle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-[#a0a0a0]">Vocal Style</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs text-[#a0a0a0]">Instrumental</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.instrumental}
                    onClick={() => set('instrumental', !form.instrumental)}
                    className={`relative w-9 h-5 rounded-full transition-colors ${
                      form.instrumental ? 'bg-[#d7af74]' : 'bg-[#2a2a2a]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                        form.instrumental ? 'translate-x-4' : ''
                      }`}
                    />
                  </button>
                </label>
              </div>
              {!form.instrumental && (
                <input
                  type="text"
                  value={form.vocalStyle}
                  onChange={(e) => set('vocalStyle', e.target.value)}
                  placeholder="e.g. Smooth male tenor, breathy"
                  className={inputCls}
                />
              )}
            </div>

            {/* Lyrical themes — only if not instrumental */}
            {!form.instrumental && (
              <TagInput
                label="Lyrical Themes"
                tags={form.lyricalThemes}
                onChange={(v) => set('lyricalThemes', v)}
                placeholder="e.g. nostalgia, longing"
              />
            )}

            {/* Contraindications */}
            <TagInput
              label="Contraindications"
              tags={form.contraindications}
              onChange={(v) => set('contraindications', v)}
              placeholder="What NOT to include"
            />
          </div>
        </div>

        {/* RIGHT — Output */}
        <div className="space-y-5">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6 lg:sticky lg:top-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                Generated Prompt
              </h2>
              <span className="text-xs text-[#555] font-mono">
                {platform === 'suno' ? 'SUNO' : 'ACE-STEP'} &middot; {prompt.length} chars
              </span>
            </div>

            {/* Prompt output */}
            <div className="relative">
              <pre className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-4 text-sm text-white font-mono whitespace-pre-wrap break-words min-h-[200px] max-h-[420px] overflow-y-auto leading-relaxed">
                {prompt}
              </pre>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#2a2a2a] hover:bg-[#333] text-white text-sm font-medium rounded-lg transition-colors"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>

              <button
                onClick={handleSaveTrack}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#d7af74] hover:bg-[#c9a060] disabled:opacity-50 disabled:cursor-not-allowed text-black text-sm font-medium rounded-lg transition-colors"
              >
                {saving ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                )}
                Save as Track
              </button>
            </div>

            {/* Auto-title preview */}
            <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
              <p className="text-xs text-[#555]">
                Track title: <span className="text-[#a0a0a0]">{autoTitle}</span>
              </p>
              {selectedIcpId && (
                <p className="text-xs text-[#555] mt-1">
                  Pilot:{' '}
                  <span className="text-[#a0a0a0]">
                    {icps.find((i) => i.id === selectedIcpId)?.pilots?.name ?? 'Unknown'}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
