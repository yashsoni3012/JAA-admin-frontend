'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, ArrowRight, AlertCircle, CheckCircle2, ShieldCheck, KeyRound } from 'lucide-react';
import { adminForgotPassword } from '@/services/auth.service';
import { useToast } from '@/contexts/ToastContext';
import { ROUTES } from '@/constants/routes';
import { validateEmail } from '@/utils/validation';
import Button from '@/components/common/Button';
import Logo from '@/components/common/Logo';

export default function ForgetPasswordForm() {
  const router = useRouter();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);
  const [countdown, setCountdown] = useState(3);

  // Auto-redirect timer when reset link is generated
  useEffect(() => {
    if (!successInfo?.targetUrl) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      router.push(successInfo.targetUrl);
    }
  }, [successInfo, countdown, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    const error = validateEmail(email);
    setEmailError(error);
    if (error) return;

    setSubmitting(true);
    try {
      const result = await adminForgotPassword(email);
      const token = result.resetToken;

      const targetUrl = token
        ? `${ROUTES.RESET_PASSWORD}?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
        : `${ROUTES.RESET_PASSWORD}?email=${encodeURIComponent(email)}`;

      setSuccessInfo({
        message: result.message || 'Password reset link sent successfully.',
        token,
        targetUrl,
      });

      showToast('Reset link generated! Redirecting to reset page...', 'success');
    } catch (err) {
      const msg = err.message || 'Unable to request password reset.';
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
          <KeyRound className="h-6 w-6 stroke-[2.2]" />
        </div>
        <h1 className="text-2xl font-bold text-ink tracking-tight">Forgot Password?</h1>
        <p className="mt-2 text-sm text-slate-500">
          Enter your registered admin email address and we'll send you a secure password reset link.
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

      {/* Success State with Automatic Redirect */}
      {successInfo ? (
        <div className="mt-6 space-y-5 animate-in fade-in duration-300">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3 shadow-xs">
              <CheckCircle2 className="h-6 w-6 stroke-[2.5]" />
            </div>
            <h3 className="font-bold text-emerald-950 text-base">Reset Link Generated!</h3>
            <p className="mt-1.5 text-xs text-emerald-700 leading-relaxed max-w-xs mx-auto">
              {successInfo.message}
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-100/80 border border-emerald-200 px-3.5 py-1 text-xs font-semibold text-emerald-800">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span>Redirecting to reset page in {countdown}s...</span>
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={() => router.push(successInfo.targetUrl)}
            className="w-full py-3.5 text-sm font-semibold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
          >
            <span>Proceed to Reset Password</span>
            <ArrowRight className="h-4 w-4" />
          </Button>

          <div className="text-center">
            <Link
              href={ROUTES.LOGIN}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-ink transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
          {/* Email Address */}
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-ink">
              Email address
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(emailError)}
                aria-describedby={emailError ? 'email-error' : undefined}
                placeholder="admin@gmail.com"
                className={`${inputBase} ${emailError ? 'border-red-400' : 'border-slate-200'}`}
              />
            </div>
            {emailError && (
              <p id="email-error" className="mt-1.5 text-xs font-medium text-red-500">
                {emailError}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            className="w-full py-3.5 text-base font-semibold shadow-lg shadow-blue-500/25"
          >
            {submitting ? 'Generating Reset Link…' : 'Send Reset Link'}
          </Button>

          {/* Quick Helper for Demo Admin */}
          {/* <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Admin account hint:</span>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@gmail.com');
                setEmailError('');
                setFormError('');
              }}
              className="font-semibold text-brand-600 hover:underline"
            >
              Fill admin@gmail.com
            </button>
          </div> */}

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
      )}
    </div>
  );
}
