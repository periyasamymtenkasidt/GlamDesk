import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  FileText,
  Wallet,
  Store,
  Database,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Sparkles,
  MapPin,
  X,
} from 'lucide-react';
import SignOutModal from '../components/modals/SignOutModal';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { id: 'dashboard',    label: 'Dashboard',    path: '/',             Icon: LayoutDashboard },
  { id: 'appointments', label: 'Appointments', path: '/appointments', Icon: CalendarCheck   },
  { id: 'clients',      label: 'Clients',      path: '/clients',      Icon: Users           },
  { id: 'quotations',   label: 'Quotations',   path: '/quotations',   Icon: FileText        },
  {
    id: 'payments',
    label: 'Payments',
    path: '/payments',
    Icon: Wallet,
    subItems: [
      { id: 'client-payments', label: 'Client Payments', path: '/payments/client', Icon: Users },
      { id: 'vendor-payments', label: 'Vendor Payments', path: '/payments/vendor', Icon: Store },
    ],
  },
  {
    id: 'masters',
    label: 'Masters',
    path: '/masters',
    Icon: Database,
    subItems: [
      { id: 'service-master',       label: 'Service Master',       path: '/masters/services', Icon: Sparkles },
      { id: 'venue-pricing-master', label: 'Venue Pricing Master', path: '/masters/venue',    Icon: MapPin   },
      { id: 'vendor-master',        label: 'Vendor Master',        path: '/masters/vendors',  Icon: Store    },
    ],
  },
  { id: 'settings',     label: 'Settings',     path: '/settings',     Icon: Settings        },
];

const NavItem = ({ item, isCollapsed, onNavClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);

  const isChildActive = hasSubItems && item.subItems.some((sub) => location.pathname === sub.path || location.pathname.startsWith(sub.path));
  const isDirectActive = location.pathname === item.path || (item.path !== '/' && !hasSubItems && location.pathname.startsWith(item.path));
  const isActive = isDirectActive || isChildActive;

  const [isOpen, setIsOpen] = useState(isChildActive || isActive);
  const [showFlyout, setShowFlyout] = useState(false);
  const [prevPath, setPrevPath] = useState(location.pathname);

  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    if (isChildActive || isDirectActive) {
      setIsOpen(true);
    }
  }

  const handleParentClick = (e) => {
    if (hasSubItems) {
      e.preventDefault();
      if (!isCollapsed) {
        setIsOpen((prev) => !prev);
        if (!isChildActive && item.subItems[0]) {
          navigate(item.subItems[0].path);
          if (onNavClick) onNavClick();
        }
      } else {
        setShowFlyout((prev) => !prev);
      }
    } else {
      if (onNavClick) onNavClick();
    }
  };

  const { Icon } = item;

  // Icon only view (when collapsed on medium screens)
  if (isCollapsed) {
    return (
      <div
        className="relative group/item flex justify-center"
        onMouseEnter={() => hasSubItems && setShowFlyout(true)}
        onMouseLeave={() => hasSubItems && setShowFlyout(false)}
      >
        {hasSubItems ? (
          <button
            type="button"
            onClick={handleParentClick}
            title={item.label}
            className={[
              'flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200',
              isActive
                ? 'text-white shadow-md shadow-glam-accent/30 bg-linear-to-br from-glam-sidebar-active-from to-glam-sidebar-active-to'
                : 'text-glam-sidebar-text bg-transparent hover:bg-glam-sidebar-hover',
            ].join(' ')}
          >
            <Icon size={20} className="shrink-0" />
          </button>
        ) : (
          <NavLink
            to={item.path}
            title={item.label}
            onClick={onNavClick}
            className={[
              'flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200',
              isActive
                ? 'text-white shadow-md shadow-glam-accent/30 bg-linear-to-br from-glam-sidebar-active-from to-glam-sidebar-active-to'
                : 'text-glam-sidebar-text bg-transparent hover:bg-glam-sidebar-hover',
            ].join(' ')}
          >
            <Icon size={20} className="shrink-0" />
          </NavLink>
        )}

        {/* Flyout Menu for Collapsed Sub-items or Label Tooltip */}
        {hasSubItems ? (
          showFlyout && (
            <div className="absolute left-full top-0 ml-2.5 z-50 w-48 p-2 rounded-2xl bg-glam-surface border border-glam-border shadow-2xl backdrop-blur-xl space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wider px-2 py-1 text-glam-accent border-b border-glam-border/50 mb-1">
                {item.label}
              </p>
              {item.subItems.map((sub) => {
                const SubIcon = sub.Icon;
                const isSubActive = location.pathname === sub.path;
                return (
                  <NavLink
                    key={sub.id}
                    to={sub.path}
                    onClick={() => {
                      setShowFlyout(false);
                      if (onNavClick) onNavClick();
                    }}
                    className={[
                      'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                      isSubActive
                        ? 'text-glam-accent bg-glam-surface-alt font-semibold'
                        : 'text-glam-text opacity-80 hover:opacity-100 hover:bg-glam-surface-alt/60',
                    ].join(' ')}
                  >
                    <SubIcon size={14} className="shrink-0" />
                    <span className="truncate">{sub.label}</span>
                  </NavLink>
                );
              })}
            </div>
          )
        ) : (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2.5 z-50 px-2.5 py-1 rounded-lg bg-glam-text text-glam-surface text-xs font-medium opacity-0 group-hover/item:opacity-100 pointer-events-none transition-opacity duration-150 whitespace-nowrap shadow-md">
            {item.label}
          </div>
        )}
      </div>
    );
  }

  // Full Expanded View
  return (
    <div className="space-y-1">
      {hasSubItems ? (
        <button
          type="button"
          onClick={handleParentClick}
          className={[
            'group relative flex items-center justify-between w-[calc(100%-1rem)] mx-2 px-3 py-2.5 rounded-xl',
            'text-sm font-medium text-left transition-all duration-200',
            isActive
              ? 'text-white shadow-md shadow-glam-accent/30 bg-linear-to-br from-glam-sidebar-active-from to-glam-sidebar-active-to'
              : 'text-glam-sidebar-text bg-transparent hover:bg-glam-sidebar-hover',
          ].join(' ')}
        >
          <div className="flex items-center gap-3 truncate">
            <Icon
              size={18}
              className={`shrink-0 transition-transform duration-200 ${!isActive ? 'group-hover:scale-110' : ''}`}
            />
            <span className="truncate">{item.label}</span>
          </div>
          {isOpen ? <ChevronDown size={16} className="shrink-0 opacity-80" /> : <ChevronRight size={16} className="shrink-0 opacity-80" />}
        </button>
      ) : (
        <NavLink
          to={item.path}
          onClick={onNavClick}
          className={[
            'group relative flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl',
            'text-sm font-medium transition-all duration-200',
            isActive
              ? 'text-white shadow-md shadow-glam-accent/30 bg-linear-to-br from-glam-sidebar-active-from to-glam-sidebar-active-to'
              : 'text-glam-sidebar-text bg-transparent hover:bg-glam-sidebar-hover',
          ].join(' ')}
        >
          <Icon
            size={18}
            className={`shrink-0 transition-transform duration-200 ${!isActive ? 'group-hover:scale-110' : ''}`}
          />
          <span className="truncate flex-1">{item.label}</span>
        </NavLink>
      )}

      {/* ── Sub-Items Render ── */}
      {hasSubItems && isOpen && (
        <div className="pl-6 pr-2 space-y-1 border-l-2 border-glam-border/40 ml-5 my-1">
          {item.subItems.map((sub) => {
            const SubIcon = sub.Icon;
            const isSubActive = location.pathname === sub.path;
            return (
              <NavLink
                key={sub.id}
                to={sub.path}
                onClick={onNavClick}
                className={[
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200',
                  isSubActive
                    ? 'text-glam-accent bg-glam-sidebar-hover font-semibold shadow-xs'
                    : 'text-glam-sidebar-text opacity-80 hover:opacity-100 hover:bg-glam-sidebar-hover/60',
                ].join(' ')}
              >
                <SubIcon size={14} className="shrink-0" />
                <span className="truncate">{sub.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
};

const Sidebar = ({ isMdExpanded, isMobileOpen, onCloseMobile }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const handleConfirmSignOut = () => {
    setShowSignOutModal(false);
    if (onCloseMobile) onCloseMobile();
    logout();
    navigate('/login');
  };

  const renderNavContent = (isCollapsed) => (
    <>
      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1.5">
          {navItems.map((item) => (
            <li key={item.id} className="relative">
              <NavItem
                item={item}
                isCollapsed={isCollapsed}
                onNavClick={onCloseMobile}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Sign Out ── */}
      <div className="py-3">
        {isCollapsed ? (
          <button
            onClick={() => setShowSignOutModal(true)}
            title="Sign Out"
            id="sidebar-signout-btn"
            className="flex items-center justify-center w-10 h-10 mx-auto rounded-xl text-glam-sidebar-text bg-transparent hover:bg-glam-sidebar-hover transition-all duration-200"
          >
            <LogOut size={20} className="shrink-0" />
          </button>
        ) : (
          <button
            onClick={() => setShowSignOutModal(true)}
            id="sidebar-signout-btn"
            className="group flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all duration-200 text-glam-sidebar-text bg-transparent hover:bg-glam-sidebar-hover w-[calc(100%-1rem)]"
          >
            <LogOut size={18} className="shrink-0 transition-transform duration-200 group-hover:scale-110" />
            <span className="truncate flex-1 text-left">Sign Out</span>
          </button>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* ── Desktop & Tablet Sidebar (Hidden on mobile <768px) ── */}
      <aside
        className={`hidden md:flex flex-col h-full rounded-2xl overflow-visible shrink-0 transition-all duration-300 bg-glam-sidebar-bg backdrop-blur-md border border-glam-border shadow-xs ${
          isMdExpanded ? 'w-56' : 'md:w-16 lg:w-58'
        }`}
      >
        {/* On lg screens (>=1024px), always expanded (isCollapsed = false). On md screens (768-1023px), collapsed unless isMdExpanded is true */}
        <div className="hidden lg:flex flex-col h-full w-full">
          {renderNavContent(false)}
        </div>
        <div className="flex lg:hidden flex-col h-full w-full">
          {renderNavContent(!isMdExpanded)}
        </div>
      </aside>

      {/* ── Mobile Overlay Backdrop (<768px) ── */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-xs transition-opacity duration-300 md:hidden ${
          isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onCloseMobile}
      />

      {/* ── Mobile Sidebar Drawer (<768px) ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-glam-sidebar-bg backdrop-blur-xl border-r border-glam-border shadow-2xl flex flex-col transition-transform duration-300 ease-in-out md:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-glam-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shadow-md bg-linear-to-br from-glam-accent to-glam-accent-2">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="font-outfit font-bold text-sm text-glam-text">
              Glam<span className="text-glam-accent">Desk</span>
            </span>
          </div>
          <button
            onClick={onCloseMobile}
            aria-label="Close Sidebar"
            className="p-1 rounded-lg text-glam-text-muted hover:text-glam-text hover:bg-glam-surface-alt transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {renderNavContent(false)}
        </div>
      </aside>

      {/* ── Confirmation Modal ── */}
      <SignOutModal
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={handleConfirmSignOut}
      />
    </>
  );
};

export default Sidebar;
