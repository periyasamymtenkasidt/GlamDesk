import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const MainLayout = () => {
  const location = useLocation();
  const [isMdExpanded, setIsMdExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(location.pathname);

  // Close mobile sidebar on route change during render
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    setIsMobileOpen(false);
  }

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsMdExpanded((prev) => !prev);
    }
  };

  return (
    <div
      className="flex flex-col h-screen overflow-hidden bg-linear-to-br from-glam-bg-from to-glam-bg-to"
    >
      {/* ── TOP: Full-width Floating Header ── */}
      <div className="mx-3 sm:mx-4 mt-3 shrink-0">
        <Header onToggleSidebar={handleToggleSidebar} />
      </div>

      {/* ── BOTTOM: Sidebar + Main ── */}
      <div className="flex flex-1 min-h-0 gap-3 mx-3 sm:mx-4 mb-3 mt-3 relative">

        <Sidebar
          isMdExpanded={isMdExpanded}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        <main
          id="main-content"
          className="flex-1 overflow-y-auto scrollbar-none rounded-2xl bg-linear-to-br from-glam-bg-from to-glam-bg-to min-w-0 flex flex-col"
        >
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default MainLayout;
