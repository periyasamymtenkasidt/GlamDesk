import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Sun,
  Moon,
  ArrowRight,
  Lock,
  Mail,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/* ── Password strength calculation ── */
const getStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
};

const strengthMeta = [
  null,
  { label: 'Weak', bar: 'bg-red-400', text: 'text-red-400' },
  { label: 'Fair', bar: 'bg-amber-400', text: 'text-amber-400' },
  { label: 'Good', bar: 'bg-green-400', text: 'text-green-400' },
  { label: 'Strong', bar: 'bg-emerald-400', text: 'text-emerald-400' },
];

const PasswordStrength = ({ password }) => {
  if (!password) return null;
  const score = getStrength(password);
  const meta = strengthMeta[score] || strengthMeta[1];
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-all duration-300 ${
              i <= score ? meta.bar : 'bg-glam-border'
            }`}
          />
        ))}
      </div>
      <p className={`text-[10px] ${meta.text}`}>{meta.label}</p>
    </div>
  );
};

export const ResetPasswordPage = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  // Mode: 'forgot' (enter email) | 'reset' (enter new password)
  const [mode, setMode] = useState('forgot');
  const [email, setEmail] = useState('');
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [sentSuccess, setSentSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Validate Email
  const validateForgot = () => {
    const err = {};
    if (!email.trim()) err.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(email)) err.email = 'Enter a valid email address';
    return err;
  };

  // Validate Reset Passwords
  const validateReset = () => {
    const err = {};
    if (!passwords.newPassword) err.newPassword = 'New password is required';
    else if (passwords.newPassword.length < 8) err.newPassword = 'Password must be at least 8 characters';

    if (!passwords.confirmPassword) err.confirmPassword = 'Please confirm your password';
    else if (passwords.confirmPassword !== passwords.newPassword)
      err.confirmPassword = 'Passwords do not match';

    return err;
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    const err = validateForgot();
    if (Object.keys(err).length) {
      setErrors(err);
      return;
    }
    setErrors({});
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSentSuccess(true);
    }, 1500);
  };

  const handleResetSubmit = (e) => {
    e.preventDefault();
    const err = validateReset();
    if (Object.keys(err).length) {
      setErrors(err);
      return;
    }
    setErrors({});
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setResetSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    }, 1500);
  };

  const handleQuickFillEmail = () => {
    setEmail('artist@glamdesk.com');
    setErrors({});
  };

  // Render Sent Success state
  if (sentSuccess) {
    return (
      <div className="relative h-screen w-screen overflow-hidden flex items-center justify-center bg-linear-to-br from-glam-bg-from to-glam-bg-to p-4">
        {/* Theme toggle */}
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

        <div className="w-full max-w-md bg-glam-surface/90 backdrop-blur-xl border border-glam-border rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-linear-to-br from-glam-accent to-glam-accent-2 flex items-center justify-center shadow-2xl shadow-glam-accent/40">
            <Mail size={32} className="text-white sm:w-9 sm:h-9 animate-pulse" />
          </div>

          <div>
            <h2 className="font-outfit text-xl sm:text-2xl font-bold text-glam-text">Check your inbox</h2>
            <p className="text-xs sm:text-sm text-glam-text-muted mt-2 leading-relaxed">
              We sent password reset instructions to <br />
              <span className="font-semibold text-glam-accent">{email}</span>
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <button
              onClick={() => setMode('reset')}
              className="w-full h-11 rounded-xl bg-linear-to-r from-glam-accent to-glam-accent-2 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <KeyRound size={16} />
              Set New Password Directly
            </button>

            <Link
              to="/login"
              className="w-full h-11 rounded-xl border border-glam-border text-sm font-semibold text-glam-text hover:bg-glam-surface-alt transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render Reset Success state
  if (resetSuccess) {
    return (
      <div className="relative h-screen w-screen overflow-hidden flex items-center justify-center bg-linear-to-br from-glam-bg-from to-glam-bg-to p-4">
        <div className="w-full max-w-md bg-glam-surface/90 backdrop-blur-xl border border-glam-border rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-linear-to-br from-glam-accent to-glam-accent-2 flex items-center justify-center shadow-2xl shadow-glam-accent/40">
            <CheckCircle2 size={36} className="text-white sm:w-10 sm:h-10" />
          </div>
          <h2 className="font-outfit text-xl sm:text-2xl font-bold text-glam-text">Password Updated!</h2>
          <p className="text-xs sm:text-sm text-glam-text-muted">
            Your password has been successfully reset. Redirecting to sign in…
          </p>
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
      <div className="pointer-events-none absolute -top-24 -left-24 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-[#c9956c] opacity-20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-[#d4728f] opacity-20 blur-3xl" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md bg-glam-surface/85 backdrop-blur-xl border border-glam-border rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden transition-all duration-300">
        {/* Top Accent line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-glam-accent to-glam-accent-2" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-glam-accent to-glam-accent-2 flex items-center justify-center shadow-lg shadow-glam-accent/30 mb-3">
            <KeyRound size={24} className="text-white" />
          </div>

          <h1 className="font-outfit text-2xl sm:text-3xl font-bold text-glam-text tracking-tight">
            {mode === 'forgot' ? 'Forgot Password?' : 'Reset Your Password'}
          </h1>
          <p className="text-xs sm:text-sm text-glam-text-muted mt-1 max-w-xs">
            {mode === 'forgot'
              ? 'Enter your registered email address and we will send you password recovery instructions.'
              : 'Create a new strong password for your GlamDesk artist portal.'}
          </p>
        </div>

        {/* Mode Switch Tabs */}
        <div className="grid grid-cols-2 p-1 mb-5 bg-glam-surface-alt rounded-xl border border-glam-border/60">
          <button
            type="button"
            onClick={() => {
              setMode('forgot');
              setErrors({});
            }}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'forgot'
                ? 'bg-glam-surface text-glam-text shadow-xs border border-glam-border/40'
                : 'text-glam-text-muted hover:text-glam-text'
            }`}
          >
            Request Link
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('reset');
              setErrors({});
            }}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'reset'
                ? 'bg-glam-surface text-glam-text shadow-xs border border-glam-border/40'
                : 'text-glam-text-muted hover:text-glam-text'
            }`}
          >
            Set New Password
          </button>
        </div>

        {/* ── FORGOT PASSWORD FORM ── */}
        {mode === 'forgot' ? (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            {/* Quick Fill Demo Email */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-glam-surface-alt border border-glam-border/70 text-xs">
              <span className="text-glam-text-muted flex items-center gap-1.5">
                <Sparkles size={12} className="text-glam-accent" />
                Demo artist email:
              </span>
              <button
                type="button"
                onClick={handleQuickFillEmail}
                className="font-medium text-glam-accent hover:underline"
              >
                Use demo email
              </button>
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-glam-text flex items-center justify-between">
                <span>Email Address</span>
              </label>
              <div
                className={`flex items-center gap-2.5 h-10 sm:h-11 px-3 sm:px-3.5 rounded-xl border transition-all duration-200 bg-glam-surface-alt ${
                  errors.email
                    ? 'border-red-400 ring-2 ring-red-400/30'
                    : 'border-glam-border focus-within:border-glam-accent focus-within:ring-2 focus-within:ring-glam-accent/30'
                }`}
              >
                <Mail size={15} className="text-glam-accent shrink-0" />
                <input
                  id="reset-email"
                  type="email"
                  placeholder="artist@glamdesk.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((err) => ({ ...err, email: undefined }));
                  }}
                  className="flex-1 min-w-0 bg-transparent text-sm text-glam-text placeholder:text-glam-text-muted outline-none"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 flex items-center gap-1">⚠ {errors.email}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              id="send-reset-btn"
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
                  Sending link…
                </>
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        ) : (
          /* ── SET NEW PASSWORD FORM ── */
          <form onSubmit={handleResetSubmit} className="space-y-4">
            {/* New Password */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-glam-text">New Password</label>
              <div
                className={`flex items-center gap-2.5 h-10 sm:h-11 px-3 sm:px-3.5 rounded-xl border transition-all duration-200 bg-glam-surface-alt ${
                  errors.newPassword
                    ? 'border-red-400 ring-2 ring-red-400/30'
                    : 'border-glam-border focus-within:border-glam-accent focus-within:ring-2 focus-within:ring-glam-accent/30'
                }`}
              >
                <Lock size={15} className="text-glam-accent shrink-0" />
                <input
                  id="reset-new-password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={passwords.newPassword}
                  onChange={(e) => {
                    setPasswords((p) => ({ ...p, newPassword: e.target.value }));
                    if (errors.newPassword) setErrors((err) => ({ ...err, newPassword: undefined }));
                  }}
                  className="flex-1 min-w-0 bg-transparent text-sm text-glam-text placeholder:text-glam-text-muted outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="shrink-0 text-glam-text-muted hover:text-glam-accent transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <PasswordStrength password={passwords.newPassword} />
              {errors.newPassword && (
                <p className="text-xs text-red-400 flex items-center gap-1">⚠ {errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-glam-text">Confirm New Password</label>
              <div
                className={`flex items-center gap-2.5 h-10 sm:h-11 px-3 sm:px-3.5 rounded-xl border transition-all duration-200 bg-glam-surface-alt ${
                  errors.confirmPassword
                    ? 'border-red-400 ring-2 ring-red-400/30'
                    : 'border-glam-border focus-within:border-glam-accent focus-within:ring-2 focus-within:ring-glam-accent/30'
                }`}
              >
                <ShieldCheck size={15} className="text-glam-accent shrink-0" />
                <input
                  id="reset-confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={passwords.confirmPassword}
                  onChange={(e) => {
                    setPasswords((p) => ({ ...p, confirmPassword: e.target.value }));
                    if (errors.confirmPassword) setErrors((err) => ({ ...err, confirmPassword: undefined }));
                  }}
                  className="flex-1 min-w-0 bg-transparent text-sm text-glam-text placeholder:text-glam-text-muted outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="shrink-0 text-glam-text-muted hover:text-glam-accent transition-colors"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-400 flex items-center gap-1">⚠ {errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              id="confirm-reset-btn"
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
                  Updating password…
                </>
              ) : (
                <>
                  Update Password
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Back to Sign in link */}
        <div className="mt-5 text-center">
          <Link
            to="/login"
            id="back-to-login-link"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-glam-accent hover:underline"
          >
            <ArrowLeft size={14} />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
