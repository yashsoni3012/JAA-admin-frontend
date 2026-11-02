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
import { cn } from '@/lib/utils';

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

  // Ensure fields are completely cleared upon first load and clean up any remembered credentials
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('jaa_remember_me');
        localStorage.removeItem('jaa_remember_email');
        localStorage.removeItem('jaa_remember_password');
      } catch {}
    }
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
    <div className="w-full max-w-[420px] flex flex-col items-center">
      {/* Top Logo above the card matching reference design */}
      <div className="mb-5 md:mb-6 flex justify-center">
        <img
          src="/uploads/jaa-logo-1793261989412.png"
          alt="Jewellers Association Ahmedabad"
          className="w-[200px] sm:w-[220px] md:w-[235px] h-auto object-contain"
        />
      </div>

      {/* Login Card */}
      <div className="w-full rounded-[32px] border border-slate-100 bg-white p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)]">
        <div className="text-center">
          <h1 className="text-xl font-bold text-[#1B1F3B] tracking-tight">
            Admin Panel
          </h1>
          <p className="mt-1.5 text-xs text-slate-400">
            Enter your email address and password to access admin panel
          </p>
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

        <form onSubmit={handleSubmit} noValidate autoComplete="off" className="mt-7 space-y-4">
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

          {/* Email field */}
          <div>
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail className="h-4 w-4 stroke-[1.8]" />
              </div>
              <input
                id="email"
                name="admin_login_email"
                type="email"
                autoComplete="off"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (formError) setFormError('');
                }}
                placeholder="Enter your email"
                className={cn(
                  'w-full rounded-full border bg-white py-3 pl-11 pr-4 text-xs md:text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs transition focus:border-[#2832A4] focus:outline-none focus:ring-4 focus:ring-[#2832A4]/10',
                  errors.email ? 'border-red-400' : 'border-slate-200'
                )}
              />
            </div>
            {errors.email && (
              <p className="mt-1.5 ml-3 text-[11px] font-medium text-red-500">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password field */}
          <div>
            <div className="relative">
              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock className="h-4 w-4 stroke-[1.8]" />
              </div>
              <input
                id="password"
                name="admin_login_password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (formError) setFormError('');
                }}
                placeholder="Enter your password"
                className={cn(
                  'w-full rounded-full border bg-white py-3 pl-11 pr-11 text-xs md:text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs transition focus:border-[#2832A4] focus:outline-none focus:ring-4 focus:ring-[#2832A4]/10',
                  errors.password ? 'border-red-400' : 'border-slate-200'
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4 stroke-[1.8]" /> : <Eye className="h-4 w-4 stroke-[1.8]" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 ml-3 text-[11px] font-medium text-red-500">
                {errors.password}
              </p>
            )}
          </div>

          {/* Remember me & forgot password */}
          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="flex cursor-pointer items-center gap-2 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-slate-300 accent-[#2832A4] cursor-pointer"
              />
              <span className="font-semibold text-slate-700">Remember Me</span>
            </label>
            <Link
              href={ROUTES.FORGET_PASSWORD}
              className="font-medium text-slate-500 hover:text-[#2832A4] transition"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-gradient-to-b from-[#2832A4] to-[#3B49DF] py-3 text-sm font-semibold text-white shadow-md shadow-[#2832A4]/25 hover:opacity-95 active:scale-[0.99] disabled:opacity-60 transition cursor-pointer"
            >
              {submitting ? 'Authenticating...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
