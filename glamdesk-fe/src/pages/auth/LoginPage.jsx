import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sparkles, Sun, Moon, ArrowRight, Lock, Mail, CheckCircle2, KeyRound } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const DEMO_CREDENTIALS = {
  email: 'artist@glamdesk.com',
  password: 'GlamArtist@2026',
};

const LoginPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { login } = useAuth();
  const isDark   = theme === 'dark';
  const navigate = useNavigate();

  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});
  const [copied, setCopied]     = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email)                             e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email))  e.email    = 'Enter a valid email';
    if (!form.password)                          e.password = 'Password is required';
    return e;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      login();
      navigate('/');
    }, 1500);
  };

  const handleChange = (field) => (ev) => {
    setForm((f) => ({ ...f, [field]: ev.target.value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const handleQuickFill = () => {
    setForm(DEMO_CREDENTIALS);
    setErrors({});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden flex items-center justify-center bg-linear-to-br from-glam-bg-from to-glam-bg-to p-3 sm:p-6">

      {/* ── Theme toggle ── */}
      <button
        id="auth-theme-toggle"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className={`fixed top-3 sm:top-4 right-3 sm:right-4 z-50 flex items-center w-12 sm:w-14 h-6 sm:h-7 rounded-full border-[1.5px] border-glam-border transition-all duration-300 focus:outline-none ${
          isDark
            ? 'bg-linear-to-br from-glam-accent to-glam-accent-2 shadow-md shadow-glam-accent/40'
            : 'bg-glam-surface-alt'
        }`}
      >
        <span className={`absolute left-1 sm:left-1.5 flex items-center justify-center ${isDark ? 'text-white' : 'text-glam-accent'}`}>
          <Sun size={10} />
        </span>
        <span className={`absolute right-1 sm:right-1.5 flex items-center justify-center ${isDark ? 'text-glam-surface' : 'text-glam-text-muted'}`}>
          <Moon size={10} />
        </span>
        <span className={`absolute w-4 sm:w-5 h-4 sm:h-5 rounded-full flex items-center justify-center text-white shadow-md transition-all duration-300 ${
          isDark ? 'left-[calc(100%-18px)] sm:left-[calc(100%-22px)] bg-glam-surface-alt' : 'left-0.5 bg-linear-to-br from-glam-accent to-glam-accent-2'
        }`}>
          {isDark ? <Moon size={9} /> : <Sun size={9} />}
        </span>
      </button>

      {/* ── Card Container (Fixed max height with internal scroll) ── */}
      <div className="relative w-full max-w-sm sm:max-w-md max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex flex-col rounded-2xl sm:rounded-3xl border border-glam-border shadow-2xl bg-glam-surface overflow-hidden">

        {/* Top accent stripe */}
        <div className="absolute inset-x-0 top-0 h-0.75 bg-linear-to-r from-glam-accent via-[#d4728f] to-glam-accent-2 z-10 shrink-0" />

        {/* Scrollable Form Body */}
        <div className="px-5 sm:px-8 pt-8 sm:pt-10 pb-8 sm:pb-10 overflow-y-auto flex-1 min-h-0">

          {/* ── Brand ── */}
          <div className="flex flex-col items-center mb-5 sm:mb-6">
            <div className="relative mb-2.5 sm:mb-3">
              <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg bg-linear-to-br from-glam-accent to-glam-accent-2">
                <Sparkles size={22} className="text-white sm:w-6 sm:h-6" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-glam-accent to-glam-accent-2 blur-xl opacity-40 -z-10 scale-110" />
            </div>
            <h1 className="font-outfit text-xl sm:text-2xl font-bold tracking-tight text-glam-text">
              Welcome back
            </h1>
            <p className="text-xs sm:text-sm mt-1 text-center text-glam-text-muted">
              Sign in to your&nbsp;
              <span className="font-semibold text-glam-accent">GlamDesk</span>
              &nbsp;artist portal
            </p>
          </div>

          {/* ── Demo Credentials Box ── */}
          <div className="mb-5 sm:mb-6 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-glam-border bg-glam-surface-alt flex flex-col gap-2.5 transition-all duration-200">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-glam-accent">
                <KeyRound size={14} className="shrink-0" />
                <span className="truncate">Demo Credentials</span>
              </div>
              <button
                type="button"
                onClick={handleQuickFill}
                id="quick-fill-btn"
                className="text-[11px] sm:text-xs px-2 sm:px-2.5 py-1 rounded-lg font-semibold text-white bg-linear-to-br from-glam-accent to-glam-accent-2 hover:shadow-md active:scale-95 transition-all flex items-center gap-1 shrink-0"
              >
                {copied ? <CheckCircle2 size={12} /> : null}
                {copied ? 'Auto Filled!' : 'Auto Fill'}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div
                onClick={handleQuickFill}
                className="p-2 rounded-lg sm:rounded-xl border border-glam-border bg-glam-surface cursor-pointer hover:border-glam-accent transition-colors min-w-0"
              >
                <span className="block text-[10px] uppercase font-bold tracking-wider text-glam-text-muted">Email</span>
                <code className="font-mono text-xs font-semibold text-glam-text select-all block truncate">artist@glamdesk.com</code>
              </div>
              <div
                onClick={handleQuickFill}
                className="p-2 rounded-lg sm:rounded-xl border border-glam-border bg-glam-surface cursor-pointer hover:border-glam-accent transition-colors min-w-0"
              >
                <span className="block text-[10px] uppercase font-bold tracking-wider text-glam-text-muted">Password</span>
                <code className="font-mono text-xs font-semibold text-glam-text select-all block truncate">GlamArtist@2026</code>
              </div>
            </div>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} noValidate className="space-y-3.5 sm:space-y-4">

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-xs font-semibold uppercase tracking-wider text-glam-text-muted">
                Email address
              </label>
              <div className={`flex items-center gap-2.5 h-10 sm:h-11 px-3 sm:px-3.5 rounded-xl border transition-all duration-200 bg-glam-surface-alt ${
                errors.email
                  ? 'border-red-400 ring-2 ring-red-400/30'
                  : 'border-glam-border focus-within:border-glam-accent focus-within:ring-2 focus-within:ring-glam-accent/30'
              }`}>
                <Mail size={15} className="text-glam-accent shrink-0" />
                <input
                  id="login-email"
                  type="email"
                  placeholder="artist@glamdesk.com"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  className="flex-1 min-w-0 bg-transparent text-sm text-glam-text placeholder:text-glam-text-muted outline-none"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 flex items-center gap-1">⚠ {errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="login-password" className="text-xs font-semibold uppercase tracking-wider text-glam-text-muted">
                Password
              </label>
              <div className={`flex items-center gap-2.5 h-10 sm:h-11 px-3 sm:px-3.5 rounded-xl border transition-all duration-200 bg-glam-surface-alt ${
                errors.password
                  ? 'border-red-400 ring-2 ring-red-400/30'
                  : 'border-glam-border focus-within:border-glam-accent focus-within:ring-2 focus-within:ring-glam-accent/30'
              }`}>
                <Lock size={15} className="text-glam-accent shrink-0" />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange('password')}
                  className="flex-1 min-w-0 bg-transparent text-sm text-glam-text placeholder:text-glam-text-muted outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  className="shrink-0 text-glam-text-muted hover:text-glam-accent transition-colors duration-150"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 flex items-center gap-1">⚠ {errors.password}</p>
              )}
            </div>

            {/* Forgot password */}
            <div className="flex justify-end -mt-1">
              <Link
                to="/forgot-password"
                id="forgot-password-link"
                className="text-xs text-glam-accent hover:underline hover:opacity-80 transition-opacity"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className={`w-full h-10 sm:h-11 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 bg-linear-to-br from-glam-accent to-glam-accent-2 ${
                loading
                  ? 'opacity-70 cursor-not-allowed'
                  : 'hover:shadow-xl hover:shadow-glam-accent/40 hover:-translate-y-px active:translate-y-0'
              }`}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In to CRM
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3 my-4 sm:my-5">
            <div className="flex-1 h-px bg-glam-border" />
            <span className="text-xs text-glam-text-muted">New here?</span>
            <div className="flex-1 h-px bg-glam-border" />
          </div>

          {/* ── Sign up link ── */}
          <Link
            to="/signup"
            id="goto-signup-link"
            className="flex items-center justify-center gap-2 w-full h-10 sm:h-11 rounded-xl border border-glam-border text-xs sm:text-sm font-semibold text-glam-text hover:border-glam-accent hover:text-glam-accent hover:bg-glam-surface-alt transition-all duration-200"
          >
            Create an artist account
          </Link>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
