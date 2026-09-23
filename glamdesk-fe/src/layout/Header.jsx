import { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Sun,
  Moon,
  Sparkles,
  PanelLeft,
  Bell,
  CheckCheck,
  Trash2,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      id="header-theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to Light' : 'Switch to Dark'}
      className={`relative flex items-center w-14 h-7 rounded-full shrink-0 transition-all duration-300 focus:outline-none border-[1.5px] border-glam-border ${
        isDark
          ? 'bg-linear-to-br from-glam-accent to-glam-accent-2 shadow-md shadow-glam-accent/40'
          : 'bg-glam-surface-alt'
      }`}
    >
      {/* Left icon — Sun */}
      <span className={`absolute left-1.5 flex items-center justify-center ${isDark ? 'text-white' : 'text-glam-accent'}`}>
        <Sun size={11} />
      </span>

      {/* Right icon — Moon */}
      <span className={`absolute right-1.5 flex items-center justify-center ${isDark ? 'text-glam-surface' : 'text-glam-text-muted'}`}>
        <Moon size={11} />
      </span>

      {/* Sliding pill */}
      <span
        className={`absolute w-5 h-5 rounded-full flex items-center justify-center text-white shadow-md transition-all duration-300 ${
          isDark
            ? 'left-[calc(100%-22px)] bg-glam-surface-alt'
            : 'left-0.5 bg-linear-to-br from-glam-accent to-glam-accent-2'
        }`}
      >
        {isDark ? <Moon size={10} /> : <Sun size={10} />}
      </span>
    </button>
  );
};

const initialNotifications = [];

const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, unread: false }))
    );
  };

  const toggleReadStatus = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const removeNotification = (id, e) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        id="header-notification-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
        title="Notifications"
        className={`relative flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-200 shrink-0 ${
          isOpen
            ? 'bg-glam-surface-alt border-glam-accent text-glam-accent shadow-md'
            : 'border-glam-border text-glam-text hover:bg-glam-surface-alt hover:text-glam-accent'
        }`}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <>
            {/* Pulse effect */}
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping opacity-75" />
            {/* Badge dot / count */}
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4.25 h-4.25 px-1 rounded-full text-[9px] font-bold text-white bg-linear-to-br from-rose-500 to-glam-accent-2 border-2 border-glam-surface shadow-sm">
              {unreadCount}
            </span>
          </>
        )}
      </button>

      {/* Notifications Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl bg-glam-surface border border-glam-border shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-glam-border bg-glam-surface-alt/50">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold font-outfit text-glam-text">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-glam-accent/20 text-glam-accent border border-glam-accent/30">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-[11px] font-medium text-glam-accent hover:underline transition-all"
                  title="Mark all as read"
                >
                  <CheckCheck size={13} />
                  Mark read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="p-1 rounded-md text-glam-text-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                  title="Clear all"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-glam-border/40">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-glam-surface-alt text-glam-text-muted mb-2">
                  <Bell size={20} className="opacity-40" />
                </div>
                <p className="text-xs font-semibold text-glam-text">No notifications</p>
                <p className="text-[11px] text-glam-text-muted mt-0.5">
                  You're all caught up!
                </p>
              </div>
            ) : (
              notifications.map((n) => {
                const IconComponent = n.icon || Bell;
                return (
                  <div
                    key={n.id}
                    onClick={() => toggleReadStatus(n.id)}
                    className={`flex items-start gap-3 p-3.5 transition-colors cursor-pointer group hover:bg-glam-surface-alt/70 ${
                      n.unread ? 'bg-glam-accent/5' : ''
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${n.iconBg}`}
                    >
                      <IconComponent size={15} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p
                          className={`text-xs leading-tight ${
                            n.unread
                              ? 'font-bold text-glam-text'
                              : 'font-medium text-glam-text-muted'
                          }`}
                        >
                          {n.title}
                        </p>
                        <span className="text-[10px] text-glam-text-muted shrink-0">
                          {n.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-glam-text-muted mt-1 leading-relaxed line-clamp-2">
                        {n.description}
                      </p>
                    </div>

                    <div className="flex flex-col items-center gap-2 pt-0.5">
                      {n.unread && (
                        <span className="w-2 h-2 rounded-full bg-glam-accent shrink-0" />
                      )}
                      <button
                        onClick={(e) => removeNotification(n.id, e)}
                        className="opacity-0 group-hover:opacity-100 text-glam-text-muted hover:text-rose-500 transition-opacity p-0.5"
                        title="Remove"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Header = ({ onToggleSidebar }) => {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchValue, setSearchValue]     = useState('');

  return (
    <header className="h-14 rounded-2xl flex items-center px-4 md:px-5 gap-3 sm:gap-4 w-full bg-glam-surface border border-glam-border shadow-md">

      {/* ── Logo + Sidebar Toggle ── */}
      <div className="flex items-center gap-2.5 shrink-0 pr-3 sm:pr-4 border-r border-glam-border">
        {/* Toggle Button (Shown on Small & Medium screens, Hidden on Large screens >=1024px) */}
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
          title="Toggle Sidebar"
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-glam-border text-glam-text hover:bg-glam-surface-alt transition-colors shrink-0 lg:hidden"
        >
          <PanelLeft size={17} />
        </button>

        <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md bg-linear-to-br from-glam-accent to-glam-accent-2">
          <Sparkles size={16} className="text-white" />
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-bold leading-none font-outfit text-glam-text">
            Glam<span className="text-glam-accent">Desk</span>
          </p>
          <p className="text-[9px] tracking-widest uppercase mt-0.5 text-glam-accent">
            Artist CRM
          </p>
        </div>
      </div>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Search Bar (compact, right side) ── */}
      <div
        className={`flex items-center gap-2 h-8 px-2.5 rounded-full transition-all duration-200 overflow-hidden border ${
          searchFocused
            ? 'w-44 border-glam-accent bg-glam-surface shadow-md'
            : 'w-9 border-glam-border bg-glam-surface-alt'
        }`}
      >
        <Search size={14} className="shrink-0 text-glam-accent" />
        <input
          type="text"
          placeholder="Search…"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          className={`bg-transparent text-sm outline-none min-w-0 text-glam-text transition-all duration-200 ${
            searchFocused ? 'w-full opacity-100' : 'w-0 opacity-0'
          }`}
        />
        {searchValue && searchFocused && (
          <button
            onClick={() => setSearchValue('')}
            className="shrink-0 transition-opacity hover:opacity-70 text-glam-text-muted"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* ── Notification Icon ── */}
      <NotificationsDropdown />

      {/* ── Theme Toggle ── */}
      <ThemeToggle />

      {/* ── Profile Avatar ── */}
      <button
        id="header-profile-btn"
        className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl transition-colors duration-150 group shrink-0 bg-transparent hover:bg-glam-surface-alt"
      >
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold bg-linear-to-br from-glam-accent to-glam-accent-2">
          A
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-semibold leading-none text-glam-text">
            Ananya
          </p>
          <p className="text-[10px] text-glam-accent">
            Admin
          </p>
        </div>
      </button>
    </header>
  );
};

export default Header;
