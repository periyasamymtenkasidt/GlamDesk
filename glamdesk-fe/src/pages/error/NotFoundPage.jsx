import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Home, ArrowLeft, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export const NotFoundPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  return (
    <div className="relative h-screen w-screen overflow-hidden flex items-center justify-center bg-linear-to-br from-glam-bg-from to-glam-bg-to p-4 sm:p-6">
      {/* ── Theme toggle button ── */}
      <button
        id="not-found-theme-toggle"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className={`fixed top-3 sm:top-4 right-3 sm:right-4 z-50 flex items-center w-12 sm:w-14 h-6 sm:h-7 rounded-full border-[1.5px] border-glam-border transition-all duration-300 focus:outline-none ${
          isDark
            ? 'bg-linear-to-br from-glam-accent to-glam-accent-2 shadow-md shadow-glam-accent/40'
            : 'bg-glam-surface-alt'
        }`}
      >
        <span className={`absolute left-1 sm:left-1.5 flex items-center justify-center ${isDark ? 'text-white' : 'text-glam-accent'}`}>
          <Sun size={11} />
        </span>
        <span className={`absolute right-1 sm:right-1.5 flex items-center justify-center ${isDark ? 'text-glam-surface' : 'text-glam-text-muted'}`}>
          <Moon size={11} />
        </span>
        <span
          className={`absolute w-4 sm:w-5 h-4 sm:h-5 rounded-full flex items-center justify-center text-white shadow-md transition-all duration-300 ${
            isDark ? 'left-[calc(100%-20px)] sm:left-[calc(100%-22px)] bg-glam-surface-alt' : 'left-0.5 bg-linear-to-br from-glam-accent to-glam-accent-2'
          }`}
        >
          {isDark ? <Moon size={10} /> : <Sun size={10} />}
        </span>
      </button>

      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-[#c9956c] opacity-20 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-[#d4728f] opacity-20 blur-3xl animate-pulse" />

      {/* Main Glass Card */}
      <div className="relative z-10 w-full max-w-lg bg-glam-surface/85 backdrop-blur-xl border border-glam-border rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden text-center transition-all duration-300">
        {/* Top Accent line */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-linear-to-r from-glam-accent via-[#d4728f] to-glam-accent-2" />

        {/* 404 Large Header Badge */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <span className="font-outfit text-7xl sm:text-9xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-linear-to-br from-glam-accent via-[#d4728f] to-glam-accent-2 select-none drop-shadow-sm">
            404
          </span>
        </div>

        {/* Text Details */}
        <h1 className="font-outfit text-2xl sm:text-3xl font-bold text-glam-text tracking-tight">
          Page Not Found
        </h1>
        <p className="text-xs sm:text-sm text-glam-text-muted mt-2.5 max-w-md mx-auto leading-relaxed">
          The endpoint or page you requested does not exist or may have been moved. Double-check the URL or navigate back to the home workspace.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-8">
          <button
            onClick={() => navigate(-1)}
            id="not-found-back-btn"
            className="w-full sm:w-1/2 h-11 rounded-xl border border-glam-border text-xs sm:text-sm font-semibold text-glam-text hover:bg-glam-surface-alt transition-all duration-200 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>

          <Link
            to={isAuthenticated ? '/' : '/login'}
            id="not-found-home-btn"
            className="w-full sm:w-1/2 h-11 rounded-xl bg-linear-to-br from-glam-accent to-glam-accent-2 text-white text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg hover:-translate-y-px active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Home size={16} />
            {isAuthenticated ? 'Return to CRM' : 'Return to Login'}
          </Link>
        </div>

        {/* Sub-footer Note */}
        <div className="mt-8 pt-4 border-t border-glam-border/50 flex items-center justify-center gap-1.5 text-glam-text-muted text-[11px]">
          <Sparkles size={13} className="text-glam-accent" />
          <span>GlamDesk Artist Portal System</span>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
