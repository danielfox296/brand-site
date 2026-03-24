import { Link } from 'react-router-dom';

// Mock data — replace with Supabase queries later
const mockPilots = [
  {
    id: '1',
    name: 'West Elm',
    status: 'active' as const,
    contactsCount: 4,
    icpsCount: 3,
    tracksCount: 12,
    startDate: '2026-02-15',
  },
  {
    id: '2',
    name: 'Aesop',
    status: 'onboarding' as const,
    contactsCount: 2,
    icpsCount: 1,
    tracksCount: 0,
    startDate: '2026-03-10',
  },
  {
    id: '3',
    name: 'Ace Hotel',
    status: 'prospect' as const,
    contactsCount: 1,
    icpsCount: 0,
    tracksCount: 0,
    startDate: null,
  },
];

const mockTracksForReview = [
  {
    id: 't1',
    title: 'Ambient Folk #3',
    pilotName: 'West Elm',
    date: '2026-03-22',
  },
  {
    id: 't2',
    title: 'Lo-Fi Downtempo #7',
    pilotName: 'West Elm',
    date: '2026-03-21',
  },
  {
    id: 't3',
    title: 'Warm Jazz Instrumental #1',
    pilotName: 'Aesop',
    date: '2026-03-20',
  },
];

const mockActivity = [
  { id: 'a1', timestamp: '2026-03-24 09:12', description: 'New pilot added: Ace Hotel' },
  { id: 'a2', timestamp: '2026-03-23 16:45', description: 'Track approved: Minimal Piano #5' },
  { id: 'a3', timestamp: '2026-03-22 14:30', description: 'Track submitted for review: Ambient Folk #3' },
  { id: 'a4', timestamp: '2026-03-22 11:00', description: 'ICP created: "Boutique Hotel Lobby" for Aesop' },
  { id: 'a5', timestamp: '2026-03-21 09:55', description: 'Track submitted for review: Lo-Fi Downtempo #7' },
  { id: 'a6', timestamp: '2026-03-20 17:20', description: 'Pilot status changed: Aesop → Onboarding' },
];

const statusColors: Record<string, string> = {
  prospect: 'bg-blue-500/20 text-blue-400',
  onboarding: 'bg-yellow-500/20 text-yellow-400',
  active: 'bg-green-500/20 text-green-400',
  completed: 'bg-gray-500/20 text-gray-400',
  churned: 'bg-red-500/20 text-red-400',
};

export default function Dashboard() {
  const activePilots = mockPilots.filter((p) => !['completed', 'churned'].includes(p.status));

  return (
    <div className="space-y-10">
      {/* Active Pilots */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-lg font-semibold text-white">Active Pilots</h2>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#2a2a2a] text-[#a0a0a0]">
            {activePilots.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {activePilots.map((pilot) => (
            <Link
              key={pilot.id}
              to={`/pilots/${pilot.id}`}
              className="block bg-[#141414] border border-[#2a2a2a] rounded-lg p-5 hover:border-[#3a3a3a] transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold">{pilot.name}</h3>
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded-full capitalize ${statusColors[pilot.status]}`}
                >
                  {pilot.status}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-[#a0a0a0] mb-3">
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {pilot.contactsCount} contacts
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  {pilot.icpsCount} ICPs
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  {pilot.tracksCount} tracks
                </span>
              </div>

              {pilot.startDate && (
                <p className="text-xs text-[#666]">
                  Started {new Date(pilot.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Tracks Needing Review */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-lg font-semibold text-white">Tracks Needing Review</h2>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#d7af74]/15 text-[#d7af74]">
            {mockTracksForReview.length}
          </span>
        </div>

        <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a2a]">
                <th className="text-left px-5 py-3 text-[#a0a0a0] font-medium text-xs uppercase tracking-wider">Track</th>
                <th className="text-left px-5 py-3 text-[#a0a0a0] font-medium text-xs uppercase tracking-wider">Pilot</th>
                <th className="text-left px-5 py-3 text-[#a0a0a0] font-medium text-xs uppercase tracking-wider">Submitted</th>
                <th className="text-right px-5 py-3 text-[#a0a0a0] font-medium text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockTracksForReview.map((track) => (
                <tr key={track.id} className="border-b border-[#2a2a2a] last:border-b-0 hover:bg-[#1a1a1a] transition-colors">
                  <td className="px-5 py-3 text-white font-medium">{track.title}</td>
                  <td className="px-5 py-3 text-[#a0a0a0]">{track.pilotName}</td>
                  <td className="px-5 py-3 text-[#666]">
                    {new Date(track.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="text-xs font-medium px-3 py-1 rounded bg-green-500/15 text-green-400 hover:bg-green-500/25 transition-colors">
                        Approve
                      </button>
                      <button className="text-xs font-medium px-3 py-1 rounded bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors">
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
        </div>

        <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-5">
          <ul className="space-y-4">
            {mockActivity.map((item) => (
              <li key={item.id} className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-[#d7af74] shrink-0" />
                <div>
                  <p className="text-sm text-white">{item.description}</p>
                  <p className="text-xs text-[#666] mt-0.5">{item.timestamp}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
