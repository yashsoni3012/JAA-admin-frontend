'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Eye, EyeOff, KeyRound, Mail, ArrowLeft, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { adminResetPassword } from '@/services/auth.service';
import { useToast } from '@/contexts/ToastContext';
import { ROUTES } from '@/constants/routes';
import Button from '@/components/common/Button';
import Logo from '@/components/common/Logo';

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const queryToken = searchParams.get('token') || '';
  const queryEmail = searchParams.get('email') || '';

  const [token, setToken] = useState(queryToken);
  const [email, setEmail] = useState(queryEmail);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showTokenInput, setShowTokenInput] = useState(!queryToken);

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

      const successMsg = 'Password reset successfully! You can now log in with your new password.';

      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(
          'flash_toast',
          JSON.stringify({
            message: successMsg,
            type: 'success',
          })
        );
      }

      showToast(successMsg, 'success');

      setTimeout(() => {
        router.replace(ROUTES.LOGIN);
      }, 500);
    } catch (err) {
      const msg = err.message || 'Failed to reset password. The token may be expired or invalid.';
      setFormError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const inputBase =
    'w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-sm text-ink placeholder:text-slate-400 transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100';

  return (
    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-card sm:p-10">
      <div className="flex justify-center">
        <Logo />
      </div>

      <div className="mt-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <ShieldCheck className="h-6 w-6 stroke-[2.2]" />
        </div>
        <h1 className="text-2xl font-bold text-ink tracking-tight">Set New Password</h1>
        <p className="mt-2 text-sm text-slate-500">
          Create a new secure password for your JAA Admin account.
        </p>
      </div>

      {formError && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 animate-in fade-in duration-200"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="font-medium">{formError}</span>
        </div>
      )}

      {/* Verified Token Banner if loaded from URL */}
      {/* {queryToken && !showTokenInput && (
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
          <div className="flex items-center gap-2 font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Reset Token Verified from Link</span>
          </div>
          <button
            type="button"
            onClick={() => setShowTokenInput(true)}
            className="text-[11px] font-bold text-emerald-700 hover:underline"
          >
            Edit
          </button>
        </div>
      )} */}

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        {/* Token Input (shown if no token in URL or user clicks Edit) */}
        {showTokenInput && (
          <div>
            <label htmlFor="token" className="mb-1.5 block text-sm font-semibold text-ink">
              Reset Token
            </label>
            <div className="relative">
              <KeyRound
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste reset token here"
                className={`${inputBase} font-mono text-xs ${errors.token ? 'border-red-400' : 'border-slate-200'}`}
              />
            </div>
            {errors.token && (
              <p className="mt-1.5 text-xs font-medium text-red-500">{errors.token}</p>
            )}
          </div>
        )}

        {/* Admin Email (Read-Only) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="email" className="block text-sm font-semibold text-ink">
              Admin Email
            </label>
            {/* <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
              Read-only
            </span> */}
          </div>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="email"
              type="email"
              readOnly
              tabIndex={-1}
              value={email}
              placeholder="admin@gmail.com"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/90 py-3 pl-11 pr-4 text-sm font-medium text-slate-700 cursor-not-allowed select-all transition focus:outline-none"
            />
          </div>
        </div>

        {/* New Password */}
        <div>
          <label htmlFor="newPassword" className="mb-1.5 block text-sm font-semibold text-ink">
            New Password
          </label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
              className={`${inputBase} pr-12 ${errors.newPassword ? 'border-red-400' : 'border-slate-200'}`}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((p) => !p)}
              aria-label={showNewPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:text-slate-600 transition"
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="mt-1.5 text-xs font-medium text-red-500">{errors.newPassword}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-semibold text-ink">
            Confirm Password
          </label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className={`${inputBase} pr-12 ${errors.confirmPassword ? 'border-red-400' : 'border-slate-200'}`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((p) => !p)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:text-slate-600 transition"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs font-medium text-red-500">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            className="w-full py-3.5 text-base font-semibold shadow-lg shadow-blue-500/25"
          >
            {submitting ? 'Updating Password…' : 'Reset Password'}
          </Button>
        </div>

        <div className="pt-2 text-center">
          <Link
            href={ROUTES.LOGIN}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-ink transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}
