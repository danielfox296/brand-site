export default function TrackLibrary() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white">Track Library</h1>
      </div>

      <div className="border-2 border-dashed border-[#2a2a2a] rounded-lg p-12 flex flex-col items-center justify-center text-center">
        <svg className="w-12 h-12 text-[#2a2a2a] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
        <p className="text-[#a0a0a0] text-sm">Track library coming in Phase 5</p>
      </div>
    </div>
  );
}
