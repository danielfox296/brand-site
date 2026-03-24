export default function Settings() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white">Settings</h1>
      </div>

      <div className="space-y-6">
        {/* Supabase Connection */}
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Supabase Connection</h2>
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-sm text-red-400">Disconnected</span>
          </div>
          <p className="text-xs text-[#666] mt-3">
            Configure your Supabase project URL and anon key in <code className="text-[#a0a0a0] bg-[#1a1a1a] px-1.5 py-0.5 rounded text-[11px]">.env</code> to connect.
          </p>
        </div>

        {/* Change Password */}
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Change Password</h2>
          <div className="border-2 border-dashed border-[#2a2a2a] rounded-lg p-8 flex items-center justify-center">
            <p className="text-[#a0a0a0] text-sm">Authentication settings coming after Supabase connection</p>
          </div>
        </div>
      </div>
    </div>
  );
}
