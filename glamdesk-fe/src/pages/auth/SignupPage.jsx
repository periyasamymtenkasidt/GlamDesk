import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, Sparkles, Sun, Moon,
  ArrowRight, Lock, Mail, User, Phone, CheckCircle2,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/* ── Password strength indicator (pure Tailwind) ─────────────────── */
const getStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 8)           score++;
  if (/[A-Z]/.test(pwd))        score++;
  if (/[0-9]/.test(pwd))        score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score; // 0-4
};

const strengthMeta = [
  null,
  { label: 'Weak',   bar: 'bg-red-400',     text: 'text-red-400'     },
  { label: 'Fair',   bar: 'bg-amber-400',   text: 'text-amber-400'   },
  { label: 'Good',   bar: 'bg-green-400',   text: 'text-green-400'   },
  { label: 'Strong', bar: 'bg-emerald-400', text: 'text-emerald-400' },
];

const PasswordStrength = ({ password }) => {
  if (!password) return null;
  const score = getStrength(password);
  const meta  = strengthMeta[score];
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= score ? meta.bar : 'bg-glam-border'}`}
          />
        ))}
      </div>
      <p className={`text-[10px] ${meta.text}`}>{meta.label}</p>
    </div>
  );
};

const SignupPage = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark   = theme === 'dark';
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirm: '',
  });
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [errors, setErrors]           = useState({});
  const [success, setSuccess]         = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim())                              e.name     = 'Full name is required';
    if (!form.email)                                    e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email))         e.email    = 'Enter a valid email';
    if (form.phone && !/^\+?[\d\s-]{7,15}$/.test(form.phone)) e.phone = 'Enter a valid phone number';
    if (!form.password)                                 e.password = 'Password is required';
    else if (form.password.length < 8)                 e.password = 'Must be at least 8 characters';
    if (!form.confirm)                                  e.confirm  = 'Please confirm your password';
    else if (form.confirm !== form.password)            e.confirm  = 'Passwords do not match';
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
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    }, 1800);
  };

  const handleChange = (field) => (ev) => {
    setForm((f) => ({ ...f, [field]: ev.target.value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  /* ── Success screen ── */
  if (success) {
    return (
      <div className="h-screen w-screen overflow-hidden flex items-center justify-center bg-linear-to-br from-glam-bg-from to-glam-bg-to px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-linear-to-br from-glam-accent to-glam-accent-2 flex items-center justify-center shadow-2xl shadow-glam-accent/40">
            <CheckCircle2 size={32} className="text-white sm:w-9 sm:h-9" />
          </div>
          <h2 className="font-outfit text-xl sm:text-2xl font-bold text-glam-text">Account created!</h2>
          <p className="text-xs sm:text-sm text-glam-text-muted">Redirecting you to sign in…</p>
        </div>
      </div>
    );
  }

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
        <div className="absolute inset-x-0 top-0 h-0.75 bg-linear-to-r from-glam-accent-2 via-[#d4728f] to-glam-accent z-10 shrink-0" />

        {/* Scrollable Form Body */}
        <div className="px-5 sm:px-8 pt-8 sm:pt-10 pb-8 sm:pb-10 overflow-y-auto flex-1 min-h-0">

          {/* ── Brand ── */}
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <div className="relative mb-3 sm:mb-4">
              <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg bg-linear-to-br from-glam-accent-2 to-glam-accent">
                <Sparkles size={24} className="text-white sm:w-7 sm:h-7" />
              </div>
              <div className="absolute inset-0 rounded-2xl bg-linear-to-br from-glam-accent-2 to-glam-accent blur-xl opacity-40 -z-10 scale-110" />
            </div>
            <h1 className="font-outfit text-xl sm:text-2xl font-bold text-glam-text tracking-tight">
              Join GlamDesk
            </h1>
            <p className="text-xs sm:text-sm text-glam-text-muted mt-1 text-center">
              Create your&nbsp;
              <span className="font-semibold text-glam-accent">artist admin</span>
              &nbsp;account
            </p>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} noValidate className="space-y-3.5 sm:space-y-4">

            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="signup-name" className="text-xs font-semibold uppercase tracking-wider text-glam-text-muted">
                Full name
              </label>
              <div className={`flex items-center gap-2.5 h-10 sm:h-11 px-3 sm:px-3.5 rounded-xl border transition-all duration-200 bg-glam-surface-alt ${
                errors.name
                  ? 'border-red-400 ring-2 ring-red-400/30'
                  : 'border-glam-border focus-within:border-glam-accent focus-within:ring-2 focus-within:ring-glam-accent/30'
              }`}>
                <User size={15} className="text-glam-accent shrink-0" />
                <input
                  id="signup-name"
                  type="text"
                  placeholder="Ananya Sharma"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange('name')}
                  className="flex-1 min-w-0 bg-transparent text-sm text-glam-text placeholder:text-glam-text-muted outline-none"
                />
              </div>
              {errors.name && <p className="text-xs text-red-400 flex items-center gap-1">⚠ {errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="signup-email" className="text-xs font-semibold uppercase tracking-wider text-glam-text-muted">
                Email address
              </label>
              <div className={`flex items-center gap-2.5 h-10 sm:h-11 px-3 sm:px-3.5 rounded-xl border transition-all duration-200 bg-glam-surface-alt ${
                errors.email
                  ? 'border-red-400 ring-2 ring-red-400/30'
                  : 'border-glam-border focus-within:border-glam-accent focus-within:ring-2 focus-within:ring-glam-accent/30'
              }`}>
                <Mail size={15} className="text-glam-accent shrink-0" />
                <input
                  id="signup-email"
                  type="email"
                  placeholder="artist@glamdesk.com"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  className="flex-1 min-w-0 bg-transparent text-sm text-glam-text placeholder:text-glam-text-muted outline-none"
                />
              </div>
              {errors.email && <p className="text-xs text-red-400 flex items-center gap-1">⚠ {errors.email}</p>}
            </div>

            {/* Phone (optional) */}
            <div className="space-y-1.5">
              <label htmlFor="signup-phone" className="text-xs font-semibold uppercase tracking-wider text-glam-text-muted">
                Phone&nbsp;<span className="normal-case font-normal opacity-60">(optional)</span>
              </label>
              <div className={`flex items-center gap-2.5 h-10 sm:h-11 px-3 sm:px-3.5 rounded-xl border transition-all duration-200 bg-glam-surface-alt ${
                errors.phone
                  ? 'border-red-400 ring-2 ring-red-400/30'
                  : 'border-glam-border focus-within:border-glam-accent focus-within:ring-2 focus-within:ring-glam-accent/30'
              }`}>
                <Phone size={15} className="text-glam-accent shrink-0" />
                <input
                  id="signup-phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={handleChange('phone')}
                  className="flex-1 min-w-0 bg-transparent text-sm text-glam-text placeholder:text-glam-text-muted outline-none"
                />
              </div>
              {errors.phone && <p className="text-xs text-red-400 flex items-center gap-1">⚠ {errors.phone}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="signup-password" className="text-xs font-semibold uppercase tracking-wider text-glam-text-muted">
                Password
              </label>
              <div className={`flex items-center gap-2.5 h-10 sm:h-11 px-3 sm:px-3.5 rounded-xl border transition-all duration-200 bg-glam-surface-alt ${
                errors.password
                  ? 'border-red-400 ring-2 ring-red-400/30'
                  : 'border-glam-border focus-within:border-glam-accent focus-within:ring-2 focus-within:ring-glam-accent/30'
              }`}>
                <Lock size={15} className="text-glam-accent shrink-0" />
                <input
                  id="signup-password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
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
              <PasswordStrength password={form.password} />
              {errors.password && <p className="text-xs text-red-400 flex items-center gap-1">⚠ {errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="signup-confirm" className="text-xs font-semibold uppercase tracking-wider text-glam-text-muted">
                Confirm password
              </label>
              <div className={`flex items-center gap-2.5 h-10 sm:h-11 px-3 sm:px-3.5 rounded-xl border transition-all duration-200 bg-glam-surface-alt ${
                errors.confirm
                  ? 'border-red-400 ring-2 ring-red-400/30'
                  : form.confirm && form.confirm === form.password
                    ? 'border-green-400 ring-2 ring-green-400/30'
                    : 'border-glam-border focus-within:border-glam-accent focus-within:ring-2 focus-within:ring-glam-accent/30'
              }`}>
                <Lock size={15} className="text-glam-accent shrink-0" />
                <input
                  id="signup-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  value={form.confirm}
                  onChange={handleChange('confirm')}
                  className="flex-1 min-w-0 bg-transparent text-sm text-glam-text placeholder:text-glam-text-muted outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  className="shrink-0 text-glam-text-muted hover:text-glam-accent transition-colors duration-150"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirm && <p className="text-xs text-red-400 flex items-center gap-1">⚠ {errors.confirm}</p>}
              {!errors.confirm && form.confirm && form.confirm === form.password && (
                <p className="text-xs text-green-400 flex items-center gap-1">✓ Passwords match</p>
              )}
            </div>

            {/* Submit */}
            <button
              id="signup-submit-btn"
              type="submit"
              disabled={loading}
              className={`w-full h-10 sm:h-11 mt-2 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 transition-all duration-200 bg-linear-to-br from-glam-accent-2 to-glam-accent ${
                loading
                  ? 'opacity-70 cursor-not-allowed'
                  : 'hover:shadow-xl hover:shadow-glam-accent-2/40 hover:-translate-y-px active:translate-y-0'
              }`}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Creating account…
                </>
              ) : (
                <>
                  Create Artist Account
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          {/* ── Divider ── */}
          <div className="flex items-center gap-3 my-5 sm:my-6">
            <div className="flex-1 h-px bg-glam-border" />
            <span className="text-xs text-glam-text-muted">Already have an account?</span>
            <div className="flex-1 h-px bg-glam-border" />
          </div>

          {/* ── Login link ── */}
          <Link
            to="/login"
            id="goto-login-link"
            className="flex items-center justify-center gap-2 w-full h-10 sm:h-11 rounded-xl border border-glam-border text-xs sm:text-sm font-semibold text-glam-text hover:border-glam-accent hover:text-glam-accent hover:bg-glam-surface-alt transition-all duration-200"
          >
            Sign in instead
          </Link>

        </div>
      </div>
    </div>
  );
};

export default SignupPage;
