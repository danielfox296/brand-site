import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePilotStore } from '../stores/pilotStore';
import type { PilotWithCounts } from '../stores/pilotStore';
import type { Pilot } from '../types/pilot';

const STATUS_OPTIONS: Pilot['status'][] = ['prospect', 'onboarding', 'active', 'completed', 'churned'];

const STATUS_STYLES: Record<Pilot['status'], string> = {
  prospect: 'bg-blue-500/20 text-blue-400',
  onboarding: 'bg-yellow-500/20 text-yellow-400',
  active: 'bg-green-500/20 text-green-400',
  completed: 'bg-gray-500/20 text-gray-400',
  churned: 'bg-red-500/20 text-red-400',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '\u2014';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function Pilots() {
  const { pilots, loading, error, fetchPilots, createPilot, deletePilot } = usePilotStore();
  const [statusFilter, setStatusFilter] = useState<Pilot['status'] | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newStatus, setNewStatus] = useState<Pilot['status']>('prospect');
  const [creating, setCreating] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetchPilots();
  }, [fetchPilots]);

  const filtered: PilotWithCounts[] =
    statusFilter === 'all' ? pilots : pilots.filter((p) => p.status === statusFilter);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    await createPilot({ name: newName.trim(), status: newStatus, start_date: null, end_date: null, notes: null });
    setCreating(false);
    setNewName('');
    setNewStatus('prospect');
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    await deletePilot(id);
    setDeleteConfirmId(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-white">Pilots</h1>
        <div className="flex items-center gap-3">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Pilot['status'] | 'all')}
            className="text-sm bg-[#141414] border border-[#2a2a2a] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-[#d7af74]"
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowModal(true)}
            className="text-sm font-medium px-4 py-2 rounded-lg bg-[#d7af74] text-[#0a0a0a] hover:bg-[#c9a366] transition-colors"
          >
            New Pilot
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && pilots.length === 0 && (
        <div className="border border-[#2a2a2a] rounded-lg bg-[#141414] overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-[#2a2a2a] last:border-b-0 animate-pulse">
              <div className="h-4 w-36 bg-[#2a2a2a] rounded" />
              <div className="h-5 w-20 bg-[#2a2a2a] rounded-full" />
              <div className="h-4 w-10 bg-[#2a2a2a] rounded ml-auto" />
              <div className="h-4 w-10 bg-[#2a2a2a] rounded" />
              <div className="h-4 w-10 bg-[#2a2a2a] rounded" />
              <div className="h-4 w-24 bg-[#2a2a2a] rounded" />
              <div className="h-4 w-24 bg-[#2a2a2a] rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="border-2 border-dashed border-[#2a2a2a] rounded-lg p-12 flex flex-col items-center justify-center text-center">
          <svg
            className="w-12 h-12 text-[#2a2a2a] mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
            />
          </svg>
          <p className="text-[#a0a0a0] text-sm">
            {statusFilter === 'all'
              ? 'No pilots yet. Click "New Pilot" to add one.'
              : `No pilots with status "${statusFilter}".`}
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && filtered.length > 0 && (
        <div className="border border-[#2a2a2a] rounded-lg bg-[#141414] overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-[#2a2a2a] text-[#a0a0a0] text-xs uppercase tracking-wider">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-center">Contacts</th>
                <th className="px-5 py-3 font-medium text-center">ICPs</th>
                <th className="px-5 py-3 font-medium text-center">Tracks</th>
                <th className="px-5 py-3 font-medium">Start Date</th>
                <th className="px-5 py-3 font-medium">Last Updated</th>
                <th className="px-5 py-3 font-medium w-10" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((pilot) => (
                <tr
                  key={pilot.id}
                  className="border-b border-[#2a2a2a] last:border-b-0 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-5 py-3">
                    <Link to={`/pilots/${pilot.id}`} className="text-white font-medium hover:text-[#d7af74] transition-colors">
                      {pilot.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full ${STATUS_STYLES[pilot.status]}`}>
                      {pilot.status.charAt(0).toUpperCase() + pilot.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center text-[#a0a0a0]">{pilot.contact_count}</td>
                  <td className="px-5 py-3 text-center text-[#a0a0a0]">{pilot.icp_count}</td>
                  <td className="px-5 py-3 text-center text-[#a0a0a0]">{pilot.track_count}</td>
                  <td className="px-5 py-3 text-[#a0a0a0]">{formatDate(pilot.start_date)}</td>
                  <td className="px-5 py-3 text-[#a0a0a0]">{formatDate(pilot.updated_at)}</td>
                  <td className="px-5 py-3">
                    {deleteConfirmId === pilot.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(pilot.id);
                          }}
                          className="text-xs text-red-400 hover:text-red-300 font-medium"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(null);
                          }}
                          className="text-xs text-[#a0a0a0] hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(pilot.id);
                        }}
                        className="text-[#a0a0a0] hover:text-red-400 transition-colors"
                        title="Delete pilot"
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

      {/* New Pilot Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowModal(false)} />
          <div className="relative bg-[#141414] border border-[#2a2a2a] rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-semibold text-white mb-4">New Pilot</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-[#a0a0a0] mb-1">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Company or project name"
                  autoFocus
                  required
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#d7af74]"
                />
              </div>
              <div>
                <label className="block text-sm text-[#a0a0a0] mb-1">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as Pilot['status'])}
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d7af74]"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
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
                  {creating ? 'Creating...' : 'Create Pilot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
