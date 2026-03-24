export default function Pilots() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold text-white">Pilots</h1>
        <button className="text-sm font-medium px-4 py-2 rounded-lg bg-[#d7af74] text-[#0a0a0a] hover:bg-[#c9a366] transition-colors">
          New Pilot
        </button>
      </div>

      <div className="border-2 border-dashed border-[#2a2a2a] rounded-lg p-12 flex flex-col items-center justify-center text-center">
        <svg className="w-12 h-12 text-[#2a2a2a] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
        <p className="text-[#a0a0a0] text-sm">Pilot management coming in Phase 2</p>
      </div>
    </div>
  );
}
