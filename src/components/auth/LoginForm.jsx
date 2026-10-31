'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Eye, EyeOff, Lock, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/contexts/ToastContext';
import { ROUTES } from '@/constants/routes';
import { validateEmail, validatePassword } from '@/utils/validation';
import Button from '@/components/common/Button';
import Logo from '@/components/common/Logo';

export default function LoginForm() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Already logged in? Redirect always to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated && !submitting) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [isLoading, isAuthenticated, submitting, router]);

  // Ensure fields are completely cleared upon first load
  useEffect(() => {
    setEmail('');
    setPassword('');
    setErrors({});
    setFormError('');
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');

    const nextErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;

    setSubmitting(true);
    try {
      const session = await login({ email, password });
      const adminName = session?.user?.name ? `, ${session.user.name}` : '';
      const successMessage = `Login successful! Welcome back${adminName}.`;

      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(
          'flash_toast',
          JSON.stringify({
            message: successMessage,
            type: 'success',
          })
        );
      }
      showToast(successMessage, 'success');

      setTimeout(() => {
        router.replace(ROUTES.DASHBOARD);
      }, 450);
    } catch (error) {
      const errorMsg = error.message || 'Invalid email or password.';
      setFormError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  // Quick fill helper for testing
  const handleQuickFill = (fillEmail, fillPassword) => {
    setEmail(fillEmail);
    setPassword(fillPassword);
    setErrors({});
    setFormError('');
  };

  const inputBase =
    'w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-sm text-ink placeholder:text-slate-400 transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100';

  return (
    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-card sm:p-10">
      <div className="flex justify-center">
        <Logo />
      </div>

      <div className="mt-8 text-center">
        <h1 className="text-2xl font-bold text-ink tracking-tight">Admin Login</h1>
        <p className="mt-2 text-sm text-slate-500">Sign in to manage members, events, and approvals.</p>
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

      <form onSubmit={handleSubmit} noValidate autoComplete="off" className="mt-6 space-y-5">
        {/* Hidden decoy fields to catch aggressive browser autofill */}
        <div
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
        >
          <input type="text" name="fake_email_decoy" tabIndex={-1} autoComplete="off" defaultValue="" />
          <input
            type="password"
            name="fake_password_decoy"
            tabIndex={-1}
            autoComplete="new-password"
            defaultValue=""
          />
        </div>

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
              name="admin_login_email"
              type="email"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              placeholder="admin@gmail.com"
              className={`${inputBase} ${errors.email ? 'border-red-400' : 'border-slate-200'}`}
            />
          </div>
          {errors.email && (
            <p id="email-error" className="mt-1.5 text-xs font-medium text-red-500">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-ink">
            Password
          </label>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="password"
              name="admin_login_password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
              placeholder="••••••••"
              className={`${inputBase} pr-12 ${errors.password ? 'border-red-400' : 'border-slate-200'}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:text-slate-600 transition"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="mt-1.5 text-xs font-medium text-red-500">
              {errors.password}
            </p>
          )}
        </div>

        {/* Remember me & forgot password */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-slate-600 select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
            />
            Remember me
          </label>
          <Link
            href={ROUTES.FORGET_PASSWORD}
            className="font-medium text-brand-600 hover:underline text-xs sm:text-sm"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          loading={submitting}
          className="w-full py-3.5 text-base font-semibold shadow-lg shadow-blue-500/25"
        >
          {submitting ? 'Authenticating…' : 'Sign in'}
        </Button>
      </form>
    </div>
  );
}
