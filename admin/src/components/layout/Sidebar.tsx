import { NavLink } from 'react-router-dom';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navSections = [
  {
    label: 'HOME',
    items: [
      {
        to: '/',
        label: 'Dashboard',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
            <path d="M9 21V12h6v9" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'PILOTS',
    items: [
      {
        to: '/pilots',
        label: 'All Pilots',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 00-3-3.87" />
            <path d="M16 3.13a4 4 0 010 7.75" />
          </svg>
        ),
      },
      {
        to: '/pilots/new',
        label: '+ New Pilot',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v8M8 12h8" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'MUSIC',
    items: [
      {
        to: '/tracks',
        label: 'Tracks',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        ),
      },
      {
        to: '/playlists',
        label: 'Playlists',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
          </svg>
        ),
      },
      {
        to: '/prompts',
        label: 'Prompt Generator',
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 17 10 11 4 5" />
            <line x1="12" y1="19" x2="20" y2="19" />
          </svg>
        ),
      },
    ],
  },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const linkClasses = (isActive: boolean) =>
    `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors relative ${
      isActive
        ? 'text-[#d7af74] bg-[#d7af74]/10 before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:rounded-full before:bg-[#d7af74]'
        : 'text-[#a0a0a0] hover:text-white hover:bg-white/5'
    }`;

  return (
    <aside
      className="flex flex-col h-screen border-r border-[#2a2a2a] bg-[#141414] transition-all duration-200 shrink-0"
      style={{ width: collapsed ? 64 : 240 }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-[#2a2a2a]">
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="text-[#d7af74] font-semibold text-lg tracking-tight">
              Entuned
            </span>
            <span className="text-[#a0a0a0] text-[11px] -mt-0.5">Admin</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md text-[#a0a0a0] hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {collapsed ? (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            ) : (
              <polyline points="15 18 9 12 15 6" />
            )}
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {navSections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <div className="px-3 mb-2 text-[10px] font-semibold tracking-widest text-[#a0a0a0]/60 uppercase">
                {section.label}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => linkClasses(isActive)}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Divider + Settings */}
      <div className="border-t border-[#2a2a2a] p-2">
        <NavLink
          to="/settings"
          className={({ isActive }) => linkClasses(isActive)}
          title={collapsed ? 'Settings' : undefined}
        >
          <span className="shrink-0">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1.08-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1.08 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001.08 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1.08z" />
            </svg>
          </span>
          {!collapsed && <span>Settings</span>}
        </NavLink>
      </div>
    </aside>
  );
}
