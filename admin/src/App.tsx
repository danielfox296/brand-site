import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './lib/auth';
import Shell from './components/layout/Shell';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Pilots from './pages/Pilots';
import PilotDetail from './pages/PilotDetail';
import ICPDetail from './pages/ICPDetail';
import TrackLibrary from './pages/TrackLibrary';
import Playlists from './pages/Playlists';
import PromptGenerator from './pages/PromptGenerator';
import Settings from './pages/Settings';

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
