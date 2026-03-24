import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './lib/auth';
import Shell from './components/layout/Shell';
import Login from './pages/Login';

/* ------------------------------------------------------------------ */
/*  Placeholder pages — each will be replaced by a dedicated module   */
/* ------------------------------------------------------------------ */
function Dashboard() {
  return <div className="text-[#a0a0a0]">Dashboard — coming soon</div>;
}
function Pilots() {
  return <div className="text-[#a0a0a0]">Pilots — coming soon</div>;
}
function PilotDetail() {
  return <div className="text-[#a0a0a0]">Pilot Detail — coming soon</div>;
}
function ICPDetail() {
  return <div className="text-[#a0a0a0]">ICP Detail — coming soon</div>;
}
function TrackLibrary() {
  return <div className="text-[#a0a0a0]">Track Library — coming soon</div>;
}
function Playlists() {
  return <div className="text-[#a0a0a0]">Playlists — coming soon</div>;
}
function PromptGenerator() {
  return <div className="text-[#a0a0a0]">Prompt Generator — coming soon</div>;
}
function Settings() {
  return <div className="text-[#a0a0a0]">Settings — coming soon</div>;
}

/* ------------------------------------------------------------------ */
/*  Auth guard                                                        */
/* ------------------------------------------------------------------ */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

/* ------------------------------------------------------------------ */
/*  App                                                               */
/* ------------------------------------------------------------------ */
export default function App() {
  return (
    <BrowserRouter basename="/admin">
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected — wrapped in Shell layout */}
        <Route
          element={
            <ProtectedRoute>
              <Shell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="pilots" element={<Pilots />} />
          <Route path="pilots/:id" element={<PilotDetail />} />
          <Route path="pilots/:pilotId/icps/:icpId" element={<ICPDetail />} />
          <Route path="tracks" element={<TrackLibrary />} />
          <Route path="playlists" element={<Playlists />} />
          <Route path="playlists/:id" element={<Playlists />} />
          <Route path="prompts" element={<PromptGenerator />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
