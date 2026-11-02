'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, KeyRound, Mail, ArrowLeft, AlertCircle } from 'lucide-react';
import { adminResetPassword, adminVerifyResetToken } from '@/services/auth.service';
import { useToast } from '@/contexts/ToastContext';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const queryToken = searchParams.get('token') || '';
  const queryEmail = searchParams.get('email') || '';

  const [token, setToken] = useState(queryToken);
  const [email, setEmail] = useState(queryEmail);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showTokenInput, setShowTokenInput] = useState(!queryToken);

  // Retrieve email and token from URL or storage, or verify token via backend
  useEffect(() => {
    // 1. Resolve token
    let resolvedToken = queryToken;
    if (!resolvedToken && typeof window !== 'undefined') {
      resolvedToken = window.sessionStorage.getItem('reset_token') || '';
      if (resolvedToken) {
        setToken(resolvedToken);
        setShowTokenInput(false);
      }
    }

    // 2. Resolve email from query or storage
    let resolvedEmail = queryEmail;
    if (!resolvedEmail && typeof window !== 'undefined') {
      resolvedEmail =
        window.sessionStorage.getItem('reset_email') ||
        window.localStorage.getItem('reset_email') ||
        '';
      if (resolvedEmail) {
        setEmail(resolvedEmail);
      }
    }

    // 3. If email is not yet available, look up via backend verify-reset-token
    if (!resolvedEmail && resolvedToken) {
      setLoadingEmail(true);
      adminVerifyResetToken(resolvedToken)
        .then((res) => {
          if (res?.valid && res?.email) {
            setEmail(res.email);
            if (typeof window !== 'undefined') {
              window.sessionStorage.setItem('reset_email', res.email);
            }
          } else if (res && !res.valid && res.message) {
            setFormError(res.message);
          }
        })
        .catch((err) => {
          console.warn('Could not verify token email:', err);
        })
        .finally(() => {
          setLoadingEmail(false);
        });
    }
  }, [queryToken, queryEmail]);

  // When user pastes/edits token manually, look up the email
  const handleTokenChange = async (val) => {
    setToken(val);
    if (errors.token) {
      setErrors((prev) => ({ ...prev, token: '' }));
    }
    if (val.trim().length >= 20 && !email) {
      setLoadingEmail(true);
      try {
        const res = await adminVerifyResetToken(val.trim());
        if (res?.valid && res?.email) {
          setEmail(res.email);
          setFormError('');
        }
      } catch {
        // ignore
      } finally {
        setLoadingEmail(false);
      }
    }
  };

  const validate = () => {
    const errs = {};
    if (!token.trim()) {
      errs.token = 'Reset token is required.';
    }
    if (!newPassword) {
      errs.newPassword = 'New password is required.';
    } else if (newPassword.length < 6) {
      errs.newPassword = 'Password must be at least 6 characters.';
    }
    if (!confirmPassword) {
      errs.confirmPassword = 'Confirm your new password.';
    } else if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }
    return errs;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await adminResetPassword({
        token,
        newPassword,
        confirmPassword,
        email: email || undefined,
      });

      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem('reset_token');
        window.sessionStorage.removeItem('reset_email');
        window.localStorage.removeItem('reset_email');
      }

      setShowSuccessModal(true);
      showToast('Password reset successfully! You can now log in.', 'success');
    } catch (err) {
      const msg = err.message || 'Failed to reset password. The token may be expired or invalid.';
      setFormError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const inputPill =
    'w-full rounded-full border bg-white py-3 pl-11 pr-4 text-xs md:text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs transition focus:border-[#2832A4] focus:outline-none focus:ring-4 focus:ring-[#2832A4]/10';

  return (
    <>
      <div className="w-full max-w-[420px] flex flex-col items-center">
        {/* Top Official JAA Logo */}
        <div className="mb-5 md:mb-6 flex justify-center">
          <img
            src="/uploads/jaa-logo-1793261989412.png"
            alt="Jewellers Association Ahmedabad"
            className="w-[200px] sm:w-[220px] md:w-[235px] h-auto object-contain"
          />
        </div>

        {/* Set New Password Card */}
        <div className="w-full rounded-[32px] border border-slate-100 bg-white p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)]">
          <div className="text-center">
            <h1 className="text-xl font-bold text-[#1B1F3B] tracking-tight">
              Set New Password
            </h1>
            <p className="mt-2 text-xs text-slate-400 max-w-[280px] sm:max-w-[300px] mx-auto leading-relaxed">
              Create a new secure password for your JAA Admin account.
            </p>

            {/* Prominent Email Identifier Badge */}
            {(email || loadingEmail) && (
              <div className="mt-3.5 inline-flex items-center gap-2 rounded-full bg-blue-50/80 border border-blue-100/90 px-3.5 py-1.5 text-xs text-[#1E2A78]">
                <Mail className="h-3.5 w-3.5 text-[#2832A4] shrink-0" />
                <span className="text-slate-500 font-normal">Account:</span>
                <span className="font-semibold text-[#1E2A78] truncate max-w-[220px]">
                  {loadingEmail ? 'Verifying email...' : email}
                </span>
              </div>
            )}
          </div>

          {formError && (
            <div
              role="alert"
              className="mt-5 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50/80 px-4 py-2.5 text-xs text-red-600 animate-in fade-in duration-200"
            >
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="font-medium">{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            {/* Account Email (Read-Only) */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-slate-600">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail className="h-4 w-4 stroke-[1.8]" />
                </div>
                <input
                  id="email"
                  type="email"
                  readOnly
                  tabIndex={-1}
                  value={email || ''}
                  placeholder={loadingEmail ? 'Verifying account email...' : 'admin@gmail.com'}
                  className="w-full rounded-full border border-slate-200 bg-slate-50/90 py-3 pl-11 pr-4 text-xs md:text-sm font-medium text-slate-700 cursor-not-allowed select-all focus:outline-none"
                />
              </div>
            </div>

            {/* Token Input (shown if no token was passed or user expands it) */}
            {showTokenInput && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="token" className="block text-xs font-semibold text-slate-600">
                    Reset Token
                  </label>
                  {!queryToken && (
                    <span className="text-[11px] text-slate-400">From email link</span>
                  )}
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <KeyRound className="h-4 w-4 stroke-[1.8]" />
                  </div>
                  <input
                    id="token"
                    type="text"
                    value={token}
                    onChange={(e) => handleTokenChange(e.target.value)}
                    placeholder="Paste reset token here"
                    className={cn(inputPill, 'font-mono text-xs', errors.token && 'border-red-400')}
                  />
                </div>
                {errors.token && (
                  <p className="mt-1.5 ml-3 text-[11px] font-medium text-red-500">
                    {errors.token}
                  </p>
                )}
              </div>
            )}

            {/* New Password */}
            <div>
              <label
                htmlFor="newPassword"
                className="mb-1.5 block text-xs font-semibold text-slate-600"
              >
                New Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="h-4 w-4 stroke-[1.8]" />
                </div>
                <input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword) {
                      setErrors((prev) => ({ ...prev, newPassword: '' }));
                    }
                  }}
                  placeholder="At least 6 characters"
                  className={cn(
                    inputPill,
                    'pr-11',
                    errors.newPassword ? 'border-red-400' : 'border-slate-200'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((p) => !p)}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 stroke-[1.8]" />
                  ) : (
                    <Eye className="h-4 w-4 stroke-[1.8]" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1.5 ml-3 text-[11px] font-medium text-red-500">
                  {errors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-xs font-semibold text-slate-600"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="h-4 w-4 stroke-[1.8]" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) {
                      setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    }
                  }}
                  placeholder="Re-enter new password"
                  className={cn(
                    inputPill,
                    'pr-11',
                    errors.confirmPassword ? 'border-red-400' : 'border-slate-200'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 stroke-[1.8]" />
                  ) : (
                    <Eye className="h-4 w-4 stroke-[1.8]" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 ml-3 text-[11px] font-medium text-red-500">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-gradient-to-b from-[#2832A4] to-[#3B49DF] py-3 text-sm font-semibold text-white shadow-md shadow-[#2832A4]/25 hover:opacity-95 active:scale-[0.99] disabled:opacity-60 transition cursor-pointer"
              >
                {submitting ? 'Updating Password...' : 'Reset Password'}
              </button>
            </div>

            <div className="pt-1 text-center">
              <Link
                href={ROUTES.LOGIN}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-[#2832A4] transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal matching the application UI design */}
      {showSuccessModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200 select-none"
        >
          <div className="relative w-full max-w-[400px] sm:max-w-[420px] rounded-[32px] bg-white p-7 sm:p-9 shadow-[0_25px_70px_rgba(0,0,0,0.22)] text-center animate-in zoom-in-95 duration-200">
            {/* 3D Glossy Green Checkmark with festive sparkles */}
            <div className="flex justify-center">
              <svg
                width="110"
                height="96"
                viewBox="0 0 110 96"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto"
              >
                <defs>
                  <radialGradient id="resetGlossyGreen" cx="35%" cy="30%" r="65%">
                    <stop offset="0%" stopColor="#86EFAC" />
                    <stop offset="25%" stopColor="#4ADE80" />
                    <stop offset="65%" stopColor="#22C55E" />
                    <stop offset="90%" stopColor="#16A34A" />
                    <stop offset="100%" stopColor="#15803D" />
                  </radialGradient>
                  <filter id="resetSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#16A34A" floodOpacity="0.32" />
                  </filter>
                </defs>

                <path
                  d="M28 20 C28 23.5 30 25.5 33.5 25.5 C30 25.5 28 27.5 28 31 C28 27.5 26 25.5 22.5 25.5 C26 25.5 28 23.5 28 20 Z"
                  fill="#7C3AED"
                />
                <path
                  d="M84 25 C84 28 85.8 29.8 88.8 29.8 C85.8 29.8 84 31.6 84 34.6 C84 31.6 82.2 29.8 79.2 29.8 C82.2 29.8 84 28 84 25 Z"
                  fill="#2563EB"
                />
                <path
                  d="M78 57 C78 60.5 80 62.5 83.5 62.5 C80 62.5 78 64.5 78 68 C78 64.5 76 62.5 72.5 62.5 C76 62.5 78 60.5 78 57 Z"
                  fill="#F43F5E"
                />
                <circle cx="21" cy="39" r="2.2" fill="#FB7185" />
                <circle cx="27" cy="48" r="2" fill="#F59E0B" />
                <circle cx="89" cy="44" r="2" fill="#F59E0B" />
                <circle cx="55" cy="46" r="24" fill="url(#resetGlossyGreen)" filter="url(#resetSoftGlow)" />
                <ellipse cx="49" cy="32" rx="10" ry="4.5" fill="white" opacity="0.38" transform="rotate(-18 49 32)" />
                <path
                  d="M45.5 45.5 L52 52 L64.5 39.5"
                  fill="none"
                  stroke="white"
                  strokeWidth="4.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h2 className="mt-3 text-lg sm:text-xl font-bold text-[#1B1F3B] tracking-tight">
              Password Reset Successfully!
            </h2>

            <p className="mt-2 text-xs text-slate-500 max-w-[280px] sm:max-w-[300px] mx-auto leading-relaxed">
              Your password has been updated. You can now use your new password to access the JAA Admin panel.
            </p>

            {/* Decorative JAA Diamond Divider */}
            <div className="my-5 flex items-center justify-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#E11D26]" />
              <span className="h-[1.5px] w-14 sm:w-16 bg-[#E11D26]" />
              <div className="relative mx-1">
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 text-[#1E2A78] stroke-[1.8]"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    d="M6 3h12l4 6-10 12L2 9l4-6z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M2 9h20" strokeLinecap="round" />
                  <path d="M12 21L7 9l4-6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 21l5-12-4-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="absolute -top-1 -right-1 text-[9px] text-[#1E2A78] leading-none">✦</span>
              </div>
              <span className="h-[1.5px] w-14 sm:w-16 bg-[#1E2A78]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#1E2A78]" />
            </div>

            {/* Back to Login Button */}
            <button
              type="button"
              onClick={() => router.push(ROUTES.LOGIN)}
              className="w-full rounded-full bg-gradient-to-r from-[#2832A4] to-[#3B49DF] py-3 text-sm font-semibold text-white shadow-md shadow-[#2832A4]/25 hover:opacity-95 active:scale-[0.99] transition cursor-pointer"
            >
              Back to Login
            </button>
          </div>
        </div>
      )}
    </>
  );
}
