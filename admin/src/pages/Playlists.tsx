import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Playlist, PlaylistTrack } from '../types/music';
import type { Track } from '../types/music';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PlaylistRow extends Playlist {
  pilots: { name: string } | null;
  playlist_tracks: { count: number }[];
}

interface DetailTrack extends PlaylistTrack {
  tracks: Pick<Track, 'id' | 'title' | 'duration_seconds' | 'rating'> | null;
}

interface PilotOption {
  id: string;
  name: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_OPTIONS: Playlist['status'][] = ['draft', 'active', 'paused', 'archived'];

const STATUS_STYLES: Record<Playlist['status'], string> = {
  draft: 'bg-gray-500/20 text-gray-400',
  active: 'bg-green-500/20 text-green-400',
  paused: 'bg-yellow-500/20 text-yellow-400',
  archived: 'bg-gray-700/30 text-gray-500',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '\u2014';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDuration(totalSeconds: number): string {
  if (!totalSeconds) return '0:00';
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hrs > 0) return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function formatDurationLong(totalSeconds: number): string {
  if (!totalSeconds) return '0 min';
  const hrs = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

function renderStars(rating: number | null) {
  const r = rating ?? 0;
  return (
    <span className="inline-flex gap-px text-sm">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= r ? 'text-[#d7af74]' : 'text-[#2a2a2a]'}>
          &#9733;
        </span>
      ))}
    </span>
  );
}

// ===========================================================================
// Component
// ===========================================================================

export default function Playlists() {
  const { id } = useParams<{ id: string }>();
  return id ? <PlaylistDetail id={id} /> : <PlaylistList />;
}

// ===========================================================================
// LIST VIEW
// ===========================================================================

function PlaylistList() {
  const navigate = useNavigate();

  const [playlists, setPlaylists] = useState<PlaylistRow[]>([]);
  const [pilots, setPilots] = useState<PilotOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPilotId, setNewPilotId] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [creating, setCreating] = useState(false);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchPlaylists = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('playlists')
      .select('*, pilots(name), playlist_tracks(count)')
      .order('updated_at', { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setPlaylists((data as PlaylistRow[]) ?? []);
    }
    setLoading(false);
  }, []);

  const fetchPilots = useCallback(async () => {
    const { data } = await supabase.from('pilots').select('id, name').order('name');
    if (data) setPilots(data);
  }, []);

  useEffect(() => {
    fetchPlaylists();
    fetchPilots();
  }, [fetchPlaylists, fetchPilots]);

  const trackCount = (p: PlaylistRow): number => p.playlist_tracks?.[0]?.count ?? 0;

  // Create -------------------------------------------------------------------
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    const { error: err } = await supabase.from('playlists').insert({
      name: newName.trim(),
      pilot_id: newPilotId || null,
      notes: newNotes.trim() || null,
      status: 'draft' as const,
    });
    if (err) {
      setError(err.message);
    } else {
      setNewName('');
      setNewPilotId('');
      setNewNotes('');
      setShowModal(false);
      fetchPlaylists();
    }
    setCreating(false);
  };

  // Delete -------------------------------------------------------------------
  const handleDelete = async (id: string) => {
    const { error: err } = await supabase.from('playlists').delete().eq('id', id);
    if (err) setError(err.message);
    else setPlaylists((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirmId(null);
  };

  // -------------------------------------------------------------------------
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-white">Playlists</h1>
        <button
          onClick={() => setShowModal(true)}
          className="text-sm font-medium px-4 py-2 rounded-lg bg-[#d7af74] text-[#0a0a0a] hover:bg-[#c9a366] transition-colors"
        >
          New Playlist
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && playlists.length === 0 && (
        <div className="border border-[#2a2a2a] rounded-lg bg-[#141414] overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-[#2a2a2a] last:border-b-0 animate-pulse">
              <div className="h-4 w-36 bg-[#2a2a2a] rounded" />
              <div className="h-4 w-24 bg-[#2a2a2a] rounded" />
              <div className="h-4 w-10 bg-[#2a2a2a] rounded" />
              <div className="h-4 w-16 bg-[#2a2a2a] rounded" />
              <div className="h-5 w-16 bg-[#2a2a2a] rounded-full" />
              <div className="h-4 w-24 bg-[#2a2a2a] rounded ml-auto" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && playlists.length === 0 && (
        <div className="border-2 border-dashed border-[#2a2a2a] rounded-lg p-12 flex flex-col items-center justify-center text-center">
          <svg className="w-12 h-12 text-[#2a2a2a] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
          </svg>
          <p className="text-[#a0a0a0] text-sm">No playlists yet. Click &quot;New Playlist&quot; to create one.</p>
        </div>
      )}

      {/* Table */}
      {!loading && playlists.length > 0 && (
        <div className="border border-[#2a2a2a] rounded-lg bg-[#141414] overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-[#2a2a2a] text-[#a0a0a0] text-xs uppercase tracking-wider">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Pilot</th>
                <th className="px-5 py-3 font-medium text-center">Tracks</th>
                <th className="px-5 py-3 font-medium text-center">Duration</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Last Updated</th>
                <th className="px-5 py-3 font-medium w-10" />
              </tr>
            </thead>
            <tbody>
              {playlists.map((pl) => (
                <tr
                  key={pl.id}
                  onClick={() => navigate(`/playlists/${pl.id}`)}
                  className="border-b border-[#2a2a2a] last:border-b-0 hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3">
                    <span className="text-white font-medium hover:text-[#d7af74] transition-colors">{pl.name}</span>
                  </td>
                  <td className="px-5 py-3 text-[#a0a0a0]">{pl.pilots?.name ?? '\u2014'}</td>
                  <td className="px-5 py-3 text-center text-[#a0a0a0]">{trackCount(pl)}</td>
                  <td className="px-5 py-3 text-center text-[#a0a0a0]">\u2014</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${STATUS_STYLES[pl.status]}`}>
                      {pl.status.charAt(0).toUpperCase() + pl.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[#a0a0a0]">{formatDate(pl.updated_at)}</td>
                  <td className="px-5 py-3">
                    {deleteConfirmId === pl.id ? (
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleDelete(pl.id)}
                          className="text-xs text-red-400 hover:text-red-300 font-medium"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="text-xs text-[#a0a0a0] hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(pl.id);
                        }}
                        className="text-[#a0a0a0] hover:text-red-400 transition-colors"
                        title="Delete playlist"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Playlist Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#141414] border border-[#2a2a2a] rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-semibold text-white mb-4">New Playlist</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-[#a0a0a0] mb-1">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Playlist name"
                  autoFocus
                  required
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#d7af74]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#a0a0a0] mb-1">Pilot (optional)</label>
                <select
                  value={newPilotId}
                  onChange={(e) => setNewPilotId(e.target.value)}
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d7af74]"
                >
                  <option value="">None</option>
                  {pilots.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#a0a0a0] mb-1">Notes (optional)</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Any notes about this playlist..."
                  rows={3}
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#d7af74] resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-sm px-4 py-2 rounded-lg border border-[#2a2a2a] text-[#a0a0a0] hover:text-white hover:border-[#555] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newName.trim()}
                  className="text-sm font-medium px-4 py-2 rounded-lg bg-[#d7af74] text-[#0a0a0a] hover:bg-[#c9a366] transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Playlist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// DETAIL VIEW
// ===========================================================================

function PlaylistDetail({ id }: { id: string }) {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<DetailTrack[]>([]);
  const [pilots, setPilots] = useState<PilotOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inline editing state
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [notesValue, setNotesValue] = useState('');

  // Add tracks modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableTracks, setAvailableTracks] = useState<Track[]>([]);
  const [selectedTrackIds, setSelectedTrackIds] = useState<Set<string>>(new Set());
  const [addingTracks, setAddingTracks] = useState(false);
  const [loadingAvailable, setLoadingAvailable] = useState(false);

  // -------------------------------------------------------------------------
  // Fetch
  // -------------------------------------------------------------------------

  const fetchPlaylist = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('playlists')
      .select('*')
      .eq('id', id)
      .single();

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    setPlaylist(data as Playlist);
    setNameValue(data.name);
    setNotesValue(data.notes ?? '');
    setLoading(false);
  }, [id]);

  const fetchTracks = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('playlist_tracks')
      .select('*, tracks(id, title, duration_seconds, rating)')
      .eq('playlist_id', id)
      .order('position', { ascending: true });

    if (err) {
      setError(err.message);
      return;
    }
    setTracks((data as DetailTrack[]) ?? []);
  }, [id]);

  const fetchPilots = useCallback(async () => {
    const { data } = await supabase.from('pilots').select('id, name').order('name');
    if (data) setPilots(data);
  }, []);

  useEffect(() => {
    fetchPlaylist();
    fetchTracks();
    fetchPilots();
  }, [fetchPlaylist, fetchTracks, fetchPilots]);

  // -------------------------------------------------------------------------
  // Field saves
  // -------------------------------------------------------------------------

  const saveField = async (field: string, value: string | null) => {
    const { error: err } = await supabase
      .from('playlists')
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (err) setError(err.message);
    else {
      setPlaylist((prev) => (prev ? { ...prev, [field]: value, updated_at: new Date().toISOString() } : prev));
    }
  };

  const handleNameBlur = () => {
    setEditingName(false);
    if (nameValue.trim() && nameValue.trim() !== playlist?.name) {
      saveField('name', nameValue.trim());
    } else {
      setNameValue(playlist?.name ?? '');
    }
  };

  const handleNotesBlur = () => {
    const val = notesValue.trim() || null;
    if (val !== (playlist?.notes ?? null)) {
      saveField('notes', val);
    }
  };

  const handleStatusChange = (status: Playlist['status']) => {
    saveField('status', status);
  };

  const handlePilotChange = (pilotId: string) => {
    saveField('pilot_id', pilotId || null);
  };

  // -------------------------------------------------------------------------
  // Track reorder (up/down)
  // -------------------------------------------------------------------------

  const swapPositions = async (indexA: number, indexB: number) => {
    const updated = [...tracks];
    const a = updated[indexA];
    const b = updated[indexB];
    if (!a || !b) return;

    const posA = a.position;
    const posB = b.position;

    // Swap in local state immediately
    a.position = posB;
    b.position = posA;
    updated[indexA] = b;
    updated[indexB] = a;
    setTracks(updated);

    // Persist
    await Promise.all([
      supabase.from('playlist_tracks').update({ position: posB }).eq('id', a.id),
      supabase.from('playlist_tracks').update({ position: posA }).eq('id', b.id),
    ]);
  };

  // -------------------------------------------------------------------------
  // Remove track
  // -------------------------------------------------------------------------

  const removeTrack = async (ptId: string) => {
    const { error: err } = await supabase.from('playlist_tracks').delete().eq('id', ptId);
    if (err) {
      setError(err.message);
    } else {
      setTracks((prev) => prev.filter((t) => t.id !== ptId));
    }
  };

  // -------------------------------------------------------------------------
  // Add tracks modal
  // -------------------------------------------------------------------------

  const openAddModal = async () => {
    setShowAddModal(true);
    setSelectedTrackIds(new Set());
    setLoadingAvailable(true);

    const existingTrackIds = new Set(tracks.map((t) => t.track_id));

    const { data, error: err } = await supabase
      .from('tracks')
      .select('*')
      .eq('status', 'approved')
      .order('title');

    if (err) {
      setError(err.message);
      setLoadingAvailable(false);
      return;
    }

    const filtered = (data as Track[]).filter((t) => !existingTrackIds.has(t.id));
    setAvailableTracks(filtered);
    setLoadingAvailable(false);
  };

  const toggleTrackSelection = (trackId: string) => {
    setSelectedTrackIds((prev) => {
      const next = new Set(prev);
      if (next.has(trackId)) next.delete(trackId);
      else next.add(trackId);
      return next;
    });
  };

  const handleAddSelected = async () => {
    if (selectedTrackIds.size === 0) return;
    setAddingTracks(true);

    const maxPosition = tracks.length > 0 ? Math.max(...tracks.map((t) => t.position)) : 0;
    const inserts = Array.from(selectedTrackIds).map((trackId, i) => ({
      playlist_id: id,
      track_id: trackId,
      position: maxPosition + i + 1,
    }));

    const { error: err } = await supabase.from('playlist_tracks').insert(inserts);
    if (err) {
      setError(err.message);
    } else {
      setShowAddModal(false);
      fetchTracks();
    }
    setAddingTracks(false);
  };

  // -------------------------------------------------------------------------
  // Computed
  // -------------------------------------------------------------------------

  const totalDuration = tracks.reduce((sum, t) => sum + (t.tracks?.duration_seconds ?? 0), 0);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-4 w-20 bg-[#2a2a2a] rounded" />
        <div className="h-8 w-64 bg-[#2a2a2a] rounded" />
        <div className="h-40 bg-[#2a2a2a] rounded-lg" />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="text-center py-20">
        <p className="text-[#a0a0a0] mb-4">Playlist not found.</p>
        <Link to="/playlists" className="text-[#d7af74] hover:underline text-sm">
          Back to Playlists
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Back link */}
      <Link to="/playlists" className="inline-flex items-center gap-1 text-sm text-[#a0a0a0] hover:text-white transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back to Playlists
      </Link>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Header section */}
      <div className="border border-[#2a2a2a] rounded-lg bg-[#141414] p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div className="md:col-span-2">
            {editingName ? (
              <input
                type="text"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onBlur={handleNameBlur}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNameBlur();
                  if (e.key === 'Escape') {
                    setNameValue(playlist.name);
                    setEditingName(false);
                  }
                }}
                autoFocus
                className="text-xl font-semibold text-white bg-[#0a0a0a] border border-[#d7af74] rounded-lg px-3 py-1.5 w-full focus:outline-none"
              />
            ) : (
              <h1
                onClick={() => setEditingName(true)}
                className="text-xl font-semibold text-white cursor-pointer hover:text-[#d7af74] transition-colors"
                title="Click to edit"
              >
                {playlist.name}
              </h1>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs text-[#a0a0a0] uppercase tracking-wider mb-1.5">Status</label>
            <select
              value={playlist.status}
              onChange={(e) => handleStatusChange(e.target.value as Playlist['status'])}
              className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d7af74]"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Pilot */}
          <div>
            <label className="block text-xs text-[#a0a0a0] uppercase tracking-wider mb-1.5">Pilot</label>
            <select
              value={playlist.pilot_id ?? ''}
              onChange={(e) => handlePilotChange(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d7af74]"
            >
              <option value="">None</option>
              {pilots.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block text-xs text-[#a0a0a0] uppercase tracking-wider mb-1.5">Notes</label>
            <textarea
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              onBlur={handleNotesBlur}
              placeholder="Add notes..."
              rows={3}
              className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#d7af74] resize-none"
            />
          </div>
        </div>
      </div>

      {/* Track list */}
      <div className="border border-[#2a2a2a] rounded-lg bg-[#141414] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
            Tracks ({tracks.length})
          </h2>
          <button
            onClick={openAddModal}
            className="text-sm font-medium px-3 py-1.5 rounded-lg bg-[#d7af74] text-[#0a0a0a] hover:bg-[#c9a366] transition-colors"
          >
            Add Tracks
          </button>
        </div>

        {tracks.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-[#a0a0a0] text-sm">No tracks in this playlist yet.</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-[#2a2a2a] text-[#a0a0a0] text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium w-12">#</th>
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-5 py-3 font-medium text-center">Duration</th>
                  <th className="px-5 py-3 font-medium text-center">Rating</th>
                  <th className="px-5 py-3 font-medium text-center w-24">Reorder</th>
                  <th className="px-5 py-3 font-medium w-10" />
                </tr>
              </thead>
              <tbody>
                {tracks.map((pt, idx) => (
                  <tr
                    key={pt.id}
                    className="border-b border-[#2a2a2a] last:border-b-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3 text-[#a0a0a0] font-mono text-xs">{idx + 1}</td>
                    <td className="px-5 py-3 text-white">{pt.tracks?.title ?? 'Unknown Track'}</td>
                    <td className="px-5 py-3 text-center text-[#a0a0a0]">
                      {pt.tracks?.duration_seconds ? formatDuration(pt.tracks.duration_seconds) : '\u2014'}
                    </td>
                    <td className="px-5 py-3 text-center">{renderStars(pt.tracks?.rating ?? null)}</td>
                    <td className="px-5 py-3 text-center">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => swapPositions(idx, idx - 1)}
                          disabled={idx === 0}
                          className="p-0.5 text-[#a0a0a0] hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                          title="Move up"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                          </svg>
                        </button>
                        <button
                          onClick={() => swapPositions(idx, idx + 1)}
                          disabled={idx === tracks.length - 1}
                          className="p-0.5 text-[#a0a0a0] hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                          title="Move down"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => removeTrack(pt.id)}
                        className="text-[#a0a0a0] hover:text-red-400 transition-colors"
                        title="Remove track"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total duration */}
            <div className="px-5 py-3 border-t border-[#2a2a2a] flex justify-between text-sm">
              <span className="text-[#a0a0a0]">{tracks.length} track{tracks.length !== 1 ? 's' : ''}</span>
              <span className="text-[#a0a0a0]">Total: {formatDurationLong(totalDuration)}</span>
            </div>
          </>
        )}
      </div>

      {/* Add Tracks Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-[#141414] border border-[#2a2a2a] rounded-xl p-6 w-full max-w-lg shadow-2xl max-h-[80vh] flex flex-col">
            <h2 className="text-lg font-semibold text-white mb-4">Add Tracks</h2>

            {loadingAvailable ? (
              <div className="py-10 text-center text-[#a0a0a0] text-sm">Loading approved tracks...</div>
            ) : availableTracks.length === 0 ? (
              <div className="py-10 text-center text-[#a0a0a0] text-sm">No approved tracks available to add.</div>
            ) : (
              <>
                <div className="overflow-y-auto flex-1 -mx-6 px-6 mb-4">
                  <div className="space-y-1">
                    {availableTracks.map((track) => (
                      <label
                        key={track.id}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                          selectedTrackIds.has(track.id) ? 'bg-[#d7af74]/10 border border-[#d7af74]/30' : 'hover:bg-white/[0.03] border border-transparent'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedTrackIds.has(track.id)}
                          onChange={() => toggleTrackSelection(track.id)}
                          className="accent-[#d7af74] w-4 h-4 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{track.title}</p>
                        </div>
                        <span className="text-xs text-[#a0a0a0] shrink-0">
                          {track.duration_seconds ? formatDuration(track.duration_seconds) : '\u2014'}
                        </span>
                        <span className="shrink-0">{renderStars(track.rating)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#2a2a2a]">
                  <span className="text-xs text-[#a0a0a0]">{selectedTrackIds.size} selected</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="text-sm px-4 py-2 rounded-lg border border-[#2a2a2a] text-[#a0a0a0] hover:text-white hover:border-[#555] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddSelected}
                      disabled={addingTracks || selectedTrackIds.size === 0}
                      className="text-sm font-medium px-4 py-2 rounded-lg bg-[#d7af74] text-[#0a0a0a] hover:bg-[#c9a366] transition-colors disabled:opacity-50"
                    >
                      {addingTracks ? 'Adding...' : `Add Selected (${selectedTrackIds.size})`}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
