import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../../lib/auth';

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/pilots': 'Pilots',
  '/pilots/new': 'New Pilot',
  '/tracks': 'Track Library',
  '/playlists': 'Playlists',
  '/prompts': 'Prompt Generator',
  '/settings': 'Settings',
};

function getPageTitle(pathname: string): string {
  if (routeTitles[pathname]) return routeTitles[pathname];
  if (/^\/pilots\/[^/]+\/icps\/[^/]+$/.test(pathname)) return 'ICP Detail';
  if (/^\/pilots\/[^/]+$/.test(pathname)) return 'Pilot Detail';
  if (/^\/playlists\/[^/]+$/.test(pathname)) return 'Playlist Detail';
  return 'Dashboard';
}

export default function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="flex items-center justify-between h-14 px-6 border-b border-[#2a2a2a] bg-[#0a0a0a] shrink-0">
      {/* Page title */}
      <h1 className="text-sm font-medium text-white">{title}</h1>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#d7af74]/15 border border-[#d7af74]/30 flex items-center justify-center">
            <span className="text-[11px] font-semibold text-[#d7af74]">
              DF
            </span>
          </div>
          <span className="text-sm text-[#a0a0a0]">Daniel Fox</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-[#a0a0a0] hover:text-white transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
