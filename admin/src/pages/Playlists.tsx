export default function Playlists() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white">Playlists</h1>
      </div>

      <div className="border-2 border-dashed border-[#2a2a2a] rounded-lg p-12 flex flex-col items-center justify-center text-center">
        <svg className="w-12 h-12 text-[#2a2a2a] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
        </svg>
        <p className="text-[#a0a0a0] text-sm">Playlist management coming in Phase 5</p>
      </div>
    </div>
  );
}
