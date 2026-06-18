import { useNavigate, useLocation } from "react-router-dom";

interface SidebarProps {
  isCollapsed: boolean;
}

const NAV_ITEMS = [
  { name: 'Home', path: '/', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { name: 'Subscriptions', path: '/feed/subscriptions', icon: 'M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z' },
  { name: 'Upload', path: '/upload', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' },
  { name: 'History', path: '/feed/history', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
];

export function Sidebar({ isCollapsed }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside 
      className={`fixed left-0 top-16 bottom-0 bg-[#050505] border-r border-[#1A1A1A] z-40 flex flex-col overflow-hidden transition-all duration-300 ease-in-out
        ${isCollapsed 
          ? '-translate-x-full sm:translate-x-0 sm:w-20' // Mobile: Slide off left. Desktop: Shrink to 80px.
          : 'translate-x-0 w-60' // Mobile & Desktop: Slide in / Expand to 240px.
        }
      `}
    >
      <div className="flex-1 py-4 flex flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <button 
              key={item.name}
              onClick={() => navigate(item.path)}
              title={isCollapsed ? item.name : ''}
              className={`flex items-center h-12 rounded-xl transition-colors cursor-pointer ${
                isActive 
                  ? 'bg-[#1A1A1A] text-white' 
                  : 'text-zinc-400 hover:bg-[#1A1A1A] hover:text-white'
              } ${isCollapsed ? 'justify-start sm:justify-center px-4 sm:px-0' : 'justify-start px-4 gap-4'}`}
            >
              <svg className="w-6 h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? 2 : 1.5} d={item.icon} />
              </svg>
              
              {/* Only show text if expanded on desktop, but ALWAYS show text on mobile when open */}
              <span className={`font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${
                isCollapsed ? 'sm:w-0 sm:opacity-0' : 'w-auto opacity-100'
              }`}>
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}