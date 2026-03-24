import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Track } from '../types/music';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TrackRow extends Track {
  pilots: { name: string } | null;
  icps: { label: string } | null;
}

interface Pilot {
  id: string;
  name: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDuration(seconds: number | null): string {
  if (seconds == null) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const STATUS_COLORS: Record<Track['status'], string> = {
  review: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  approved: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  rejected: 'bg-red-500/15 text-red-400 border border-red-500/30',
  archived: 'bg-neutral-500/15 text-neutral-400 border border-neutral-500/30',
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function StatusBadge({ status }: { status: Track['status'] }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_COLORS[status]}`}
    >
      {status}
    </span>
  );
}

function Stars({
  value,
  interactive = false,
  onChange,
}: {
  value: number | null;
  interactive?: boolean;
  onChange?: (v: number) => void;
}) {
  const [hover, setHover] = useState<number | null>(null);
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= (hover ?? value ?? 0);
        return (
          <button
            key={n}
            type="button"
            disabled={!interactive}
            onClick={() => onChange?.(n)}
            onMouseEnter={() => interactive && setHover(n)}
            onMouseLeave={() => interactive && setHover(null)}
            className={`text-sm ${interactive ? 'cursor-pointer' : 'cursor-default'} ${
              filled ? 'text-[#d7af74]' : 'text-[#2a2a2a]'
            }`}
          >
            &#9733;
          </button>
        );
      })}
    </span>
  );
}

function AudioPlayer({ src }: { src: string | null }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggle = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
    } else {
      el.play();
    }
    setPlaying(!playing);
  }, [playing]);

  if (!src) {
    return (
      <div className="flex items-center gap-2 text-sm text-[#a0a0a0]">
        <span className="w-8 h-8 rounded-full bg-[#2a2a2a] flex items-center justify-center text-[#555]">
          &#9654;
        </span>
        No audio file
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={() => {
          const el = audioRef.current;
          if (el && el.duration) setProgress((el.currentTime / el.duration) * 100);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration);
        }}
        onEnded={() => setPlaying(false)}
      />
      <button
        type="button"
        onClick={toggle}
        className="w-8 h-8 rounded-full bg-[#d7af74] text-black flex items-center justify-center text-xs font-bold hover:brightness-110 transition shrink-0"
      >
        {playing ? '&#10074;&#10074;' : '&#9654;'}
      </button>
      <div className="flex-1 h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden cursor-pointer"
        onClick={(e) => {
          const el = audioRef.current;
          if (!el || !el.duration) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          el.currentTime = pct * el.duration;
        }}
      >
        <div
          className="h-full bg-[#d7af74] rounded-full transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs text-[#a0a0a0] tabular-nums shrink-0">
        {formatDuration(Math.round(duration))}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Detail Panel                                                       */
/* ------------------------------------------------------------------ */

function TrackDetail({
  track,
  onUpdate,
}: {
  track: TrackRow;
  onUpdate: (id: string, patch: Partial<Track>) => void;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [notes, setNotes] = useState(track.notes ?? '');
  const [copied, setCopied] = useState(false);

  const save = useCallback(
    (patch: Partial<Track>) => onUpdate(track.id, patch),
    [track.id, onUpdate],
  );

  const copyPrompt = useCallback(() => {
    if (track.generation_prompt) {
      navigator.clipboard.writeText(track.generation_prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }, [track.generation_prompt]);

  const addTag = useCallback(() => {
    const tag = tagInput.trim().toLowerCase();
    if (!tag || track.tags.includes(tag)) return;
    const next = [...track.tags, tag];
    save({ tags: next });
    setTagInput('');
  }, [tagInput, track.tags, save]);

  const removeTag = useCallback(
    (tag: string) => {
      save({ tags: track.tags.filter((t) => t !== tag) });
    },
    [track.tags, save],
  );

  return (
    <tr>
      <td colSpan={10} className="p-0">
        <div className="bg-[#111] border-t border-b border-[#2a2a2a] px-6 py-5 space-y-5">
          {/* Audio */}
          <div>
            <h4 className="text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider mb-2">
              Audio Preview
            </h4>
            <AudioPlayer src={track.file_url} />
          </div>

          {/* Prompt */}
          {track.generation_prompt && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">
                  Generation Prompt
                </h4>
                <button
                  type="button"
                  onClick={copyPrompt}
                  className="text-xs text-[#d7af74] hover:text-white transition"
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="bg-[#0a0a0a] border border-[#2a2a2a] rounded p-3 text-xs text-[#ccc] whitespace-pre-wrap overflow-x-auto max-h-40">
                {track.generation_prompt}
              </pre>
            </div>
          )}

          {/* Actions row */}
          <div className="flex flex-wrap items-center gap-3">
            <h4 className="text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider mr-1">
              Status
            </h4>
            <button
              type="button"
              onClick={() => save({ status: 'approved', rejection_reason: null })}
              disabled={track.status === 'approved'}
              className="px-3 py-1.5 rounded text-xs font-medium bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 hover:bg-emerald-600/30 disabled:opacity-30 disabled:cursor-default transition"
            >
              Approve
            </button>
            {!rejecting ? (
              <button
                type="button"
                onClick={() => setRejecting(true)}
                disabled={track.status === 'rejected'}
                className="px-3 py-1.5 rounded text-xs font-medium bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30 disabled:opacity-30 disabled:cursor-default transition"
              >
                Reject
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Reason..."
                  className="bg-[#0a0a0a] border border-[#2a2a2a] rounded px-2 py-1.5 text-xs text-white placeholder-[#555] w-48 focus:outline-none focus:border-red-500/50"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      save({ status: 'rejected', rejection_reason: rejectReason || null });
                      setRejecting(false);
                      setRejectReason('');
                    }
                    if (e.key === 'Escape') {
                      setRejecting(false);
                      setRejectReason('');
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    save({ status: 'rejected', rejection_reason: rejectReason || null });
                    setRejecting(false);
                    setRejectReason('');
                  }}
                  className="px-2 py-1.5 rounded text-xs font-medium bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30 transition"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => { setRejecting(false); setRejectReason(''); }}
                  className="text-xs text-[#a0a0a0] hover:text-white transition"
                >
                  Cancel
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => save({ status: 'archived' })}
              disabled={track.status === 'archived'}
              className="px-3 py-1.5 rounded text-xs font-medium bg-neutral-600/20 text-neutral-400 border border-neutral-600/30 hover:bg-neutral-600/30 disabled:opacity-30 disabled:cursor-default transition"
            >
              Archive
            </button>
          </div>

          {/* Rating */}
          <div>
            <h4 className="text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider mb-2">
              Rating
            </h4>
            <Stars value={track.rating} interactive onChange={(v) => save({ rating: v })} />
          </div>

          {/* Tags */}
          <div>
            <h4 className="text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider mb-2">
              Tags
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              {track.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 bg-[#1e1e1e] border border-[#2a2a2a] rounded-full px-2.5 py-0.5 text-xs text-[#ccc]"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-[#555] hover:text-red-400 transition leading-none"
                  >
                    &times;
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addTag();
                }}
                placeholder="Add tag..."
                className="bg-transparent border-b border-[#2a2a2a] text-xs text-white placeholder-[#555] py-1 w-24 focus:outline-none focus:border-[#d7af74]"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <h4 className="text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider mb-2">
              Notes
            </h4>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={() => {
                if (notes !== (track.notes ?? '')) save({ notes: notes || null });
              }}
              rows={3}
              className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded p-3 text-xs text-white placeholder-[#555] resize-y focus:outline-none focus:border-[#d7af74]/50"
              placeholder="Add notes..."
            />
          </div>
        </div>
      </td>
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function TrackLibrary() {
  const [tracks, setTracks] = useState<TrackRow[]>([]);
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterPilot, setFilterPilot] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterRating, setFilterRating] = useState<string>('');
  const [search, setSearch] = useState('');

  // Expand
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  /* ---- Fetch ---- */

  const fetchTracks = useCallback(async () => {
    const { data, error } = await supabase
      .from('tracks')
      .select('*, pilots(name), icps(label)')
      .order('created_at', { ascending: false });

    if (!error && data) setTracks(data as TrackRow[]);
    setLoading(false);
  }, []);

  const fetchPilots = useCallback(async () => {
    const { data } = await supabase.from('pilots').select('id, name').order('name');
    if (data) setPilots(data);
  }, []);

  useEffect(() => {
    fetchTracks();
    fetchPilots();
  }, [fetchTracks, fetchPilots]);

  /* ---- Mutations ---- */

  const updateTrack = useCallback(
    async (id: string, patch: Partial<Track>) => {
      const { error } = await supabase.from('tracks').update(patch).eq('id', id);
      if (error) return;
      setTracks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      );
    },
    [],
  );

  const bulkUpdateStatus = useCallback(
    async (status: Track['status']) => {
      const ids = Array.from(selected);
      if (!ids.length) return;
      const { error } = await supabase
        .from('tracks')
        .update({ status })
        .in('id', ids);
      if (error) return;
      setTracks((prev) =>
        prev.map((t) => (ids.includes(t.id) ? { ...t, status } : t)),
      );
      setSelected(new Set());
    },
    [selected],
  );

  /* ---- Filter logic ---- */

  const filtered = tracks.filter((t) => {
    if (filterPilot && t.pilot_id !== filterPilot) return false;
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterRating && t.rating !== Number(filterRating)) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  /* ---- Selection helpers ---- */

  const allSelected = filtered.length > 0 && filtered.every((t) => selected.has(t.id));

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((t) => t.id)));
    }
  }, [allSelected, filtered]);

  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  /* ---- Render ---- */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#d7af74] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Track Library</h1>
          <p className="text-sm text-[#a0a0a0] mt-0.5">
            {tracks.length} track{tracks.length !== 1 ? 's' : ''} total
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Pilot */}
        <select
          value={filterPilot}
          onChange={(e) => setFilterPilot(e.target.value)}
          className="bg-[#141414] border border-[#2a2a2a] rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#d7af74]/50 appearance-none cursor-pointer"
        >
          <option value="">All Pilots</option>
          {pilots.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {/* Status */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#141414] border border-[#2a2a2a] rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#d7af74]/50 appearance-none cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="review">Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="archived">Archived</option>
        </select>

        {/* Rating */}
        <select
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
          className="bg-[#141414] border border-[#2a2a2a] rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#d7af74]/50 appearance-none cursor-pointer"
        >
          <option value="">Any Rating</option>
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {'★'.repeat(n)} {n}
            </option>
          ))}
        </select>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title..."
            className="w-full bg-[#141414] border border-[#2a2a2a] rounded pl-8 pr-3 py-1.5 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#d7af74]/50"
          />
        </div>

        {(filterPilot || filterStatus || filterRating || search) && (
          <button
            type="button"
            onClick={() => {
              setFilterPilot('');
              setFilterStatus('');
              setFilterRating('');
              setSearch('');
            }}
            className="text-xs text-[#a0a0a0] hover:text-white transition"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-3 bg-[#141414] border border-[#2a2a2a] rounded px-4 py-2.5">
          <span className="text-sm text-[#a0a0a0]">
            {selected.size} selected
          </span>
          <div className="h-4 w-px bg-[#2a2a2a]" />
          <button
            type="button"
            onClick={() => bulkUpdateStatus('approved')}
            className="px-3 py-1 rounded text-xs font-medium bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 hover:bg-emerald-600/30 transition"
          >
            Approve Selected
          </button>
          <button
            type="button"
            onClick={() => bulkUpdateStatus('rejected')}
            className="px-3 py-1 rounded text-xs font-medium bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30 transition"
          >
            Reject Selected
          </button>
          <button
            type="button"
            onClick={() => {
              /* placeholder for playlist modal */
            }}
            className="px-3 py-1 rounded text-xs font-medium bg-[#d7af74]/15 text-[#d7af74] border border-[#d7af74]/30 hover:bg-[#d7af74]/25 transition"
          >
            Add to Playlist
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs text-[#a0a0a0] hover:text-white transition"
          >
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="border border-dashed border-[#2a2a2a] rounded-lg p-16 flex flex-col items-center justify-center text-center">
          <svg
            className="w-10 h-10 text-[#2a2a2a] mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
          <p className="text-[#a0a0a0] text-sm">
            {tracks.length === 0
              ? 'No tracks yet. Generated tracks will appear here.'
              : 'No tracks match your filters.'}
          </p>
        </div>
      ) : (
        <div className="border border-[#2a2a2a] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#141414] border-b border-[#2a2a2a] text-left">
                  <th className="px-3 py-2.5 w-8">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="accent-[#d7af74] cursor-pointer"
                    />
                  </th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">
                    Pilot
                  </th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">
                    ICP
                  </th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-3 py-2.5 text-xs font-semibold text-[#a0a0a0] uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e1e1e]">
                {filtered.map((track) => (
                  <>
                    <tr
                      key={track.id}
                      onClick={() =>
                        setExpandedId((prev) => (prev === track.id ? null : track.id))
                      }
                      className={`cursor-pointer transition-colors ${
                        expandedId === track.id
                          ? 'bg-[#111]'
                          : 'hover:bg-[#111]/50'
                      }`}
                    >
                      <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selected.has(track.id)}
                          onChange={() => toggleOne(track.id)}
                          className="accent-[#d7af74] cursor-pointer"
                        />
                      </td>
                      <td className="px-3 py-2.5 text-white font-medium whitespace-nowrap">
                        {track.title}
                      </td>
                      <td className="px-3 py-2.5 text-[#a0a0a0] whitespace-nowrap">
                        {track.pilots?.name ?? '—'}
                      </td>
                      <td className="px-3 py-2.5 text-[#a0a0a0] whitespace-nowrap">
                        {track.icps?.label ?? '—'}
                      </td>
                      <td className="px-3 py-2.5">
                        <StatusBadge status={track.status} />
                      </td>
                      <td className="px-3 py-2.5">
                        <Stars value={track.rating} />
                      </td>
                      <td className="px-3 py-2.5 text-[#a0a0a0] tabular-nums whitespace-nowrap">
                        {formatDuration(track.duration_seconds)}
                      </td>
                      <td className="px-3 py-2.5 text-[#a0a0a0] whitespace-nowrap">
                        {track.generation_model ?? '—'}
                      </td>
                      <td className="px-3 py-2.5">
                        {track.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {track.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="inline-block bg-[#1e1e1e] border border-[#2a2a2a] rounded-full px-2 py-0.5 text-[10px] text-[#a0a0a0]"
                              >
                                {tag}
                              </span>
                            ))}
                            {track.tags.length > 3 && (
                              <span className="text-[10px] text-[#555]">
                                +{track.tags.length - 3}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#555]">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-[#a0a0a0] whitespace-nowrap text-xs">
                        {formatDate(track.created_at)}
                      </td>
                    </tr>

                    {expandedId === track.id && (
                      <TrackDetail
                        key={`detail-${track.id}`}
                        track={track}
                        onUpdate={updateTrack}
                      />
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
