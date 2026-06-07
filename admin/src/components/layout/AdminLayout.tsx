import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar, { NAV_ITEMS } from './Sidebar';
import Topbar from './Topbar';
import { useThemeStore } from '../../stores/themeStore';

const getTitle = (pathname: string): string => {
  const all = NAV_ITEMS.flatMap((s) => s.items);
  const match = all.find((item) => item.href !== '/' && pathname.startsWith(item.href))
    || all.find((item) => item.href === pathname);
  return match?.label || 'Dashboard';
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = getTitle(location.pathname);
  const { isDark } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--c-bg)', transition: 'background 0.2s' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden lg:pl-[220px]">
        <div className="flex-shrink-0">
          <Topbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        </div>
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-5 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
