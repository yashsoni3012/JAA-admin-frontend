'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, AlertCircle } from 'lucide-react';
import { adminForgotPassword } from '@/services/auth.service';
import { useToast } from '@/contexts/ToastContext';
import { ROUTES } from '@/constants/routes';
import { validateEmail } from '@/utils/validation';
import { cn } from '@/lib/utils';

export default function ForgetPasswordForm() {
  const router = useRouter();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');

    const error = validateEmail(email);
    setEmailError(error);
    if (error) return;

    setSubmitting(true);
    try {
      const result = await adminForgotPassword(email);
      const token = result?.resetToken;

      if (token && typeof window !== 'undefined') {
        window.sessionStorage.setItem('reset_token', token);
        window.sessionStorage.setItem('reset_email', email);
      }

      setShowSuccessModal(true);
      showToast('Password reset link sent to your email!', 'success');
    } catch (err) {
      const msg = err.message || 'Unable to request password reset.';
      setFormError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="w-full max-w-[420px] flex flex-col items-center">
        {/* Top Logo matching reference design */}
        <div className="mb-5 md:mb-6 flex justify-center">
          <img
            src="/uploads/jaa-logo-1793261989412.png"
            alt="Jewellers Association Ahmedabad"
            className="w-[200px] sm:w-[220px] md:w-[235px] h-auto object-contain"
          />
        </div>

        {/* Forgot Password Card */}
        <div className="w-full rounded-[32px] border border-slate-100 bg-white p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.06)]">
          <div className="text-center">
            <h1 className="text-xl font-bold text-[#1B1F3B] tracking-tight">
              Forgot Password?
            </h1>
            <p className="mt-2 text-xs text-slate-400 max-w-[280px] sm:max-w-[300px] mx-auto leading-relaxed">
              Enter your registered email address and we&apos;ll send you a link to reset your password.
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

          <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
            {/* Email Field */}
            <div>
              <div className="relative">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail className="h-4 w-4 stroke-[1.8]" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                    if (formError) setFormError('');
                  }}
                  placeholder="Enter your email"
                  className={cn(
                    'w-full rounded-full border bg-white py-3 pl-11 pr-4 text-xs md:text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs transition focus:border-[#2832A4] focus:outline-none focus:ring-4 focus:ring-[#2832A4]/10',
                    emailError ? 'border-red-400' : 'border-slate-200'
                  )}
                />
              </div>
              {emailError && (
                <p className="mt-1.5 ml-3 text-[11px] font-medium text-red-500">
                  {emailError}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-gradient-to-b from-[#2832A4] to-[#3B49DF] py-3 text-sm font-semibold text-white shadow-md shadow-[#2832A4]/25 hover:opacity-95 active:scale-[0.99] disabled:opacity-60 transition cursor-pointer"
              >
                {submitting ? 'Submitting...' : 'Submit'}
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

      {/* Success Confirmation Modal matching Image */}
      {showSuccessModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px] animate-in fade-in duration-200 select-none"
        >
          <div className="relative w-full max-w-[400px] sm:max-w-[420px] rounded-[32px] bg-white p-7 sm:p-9 shadow-[0_25px_70px_rgba(0,0,0,0.22)] text-center animate-in zoom-in-95 duration-200">
            {/* 3D Green Checkmark with festive sparkles */}
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
                  <radialGradient id="glossyGreen" cx="35%" cy="30%" r="65%">
                    <stop offset="0%" stopColor="#86EFAC" />
                    <stop offset="25%" stopColor="#4ADE80" />
                    <stop offset="65%" stopColor="#22C55E" />
                    <stop offset="90%" stopColor="#16A34A" />
                    <stop offset="100%" stopColor="#15803D" />
                  </radialGradient>
                  <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#16A34A" floodOpacity="0.32" />
                  </filter>
                </defs>

                {/* Top-Left Purple Star Sparkle */}
                <path
                  d="M28 20 C28 23.5 30 25.5 33.5 25.5 C30 25.5 28 27.5 28 31 C28 27.5 26 25.5 22.5 25.5 C26 25.5 28 23.5 28 20 Z"
                  fill="#7C3AED"
                />

                {/* Top-Right Blue Star Sparkle */}
                <path
                  d="M84 25 C84 28 85.8 29.8 88.8 29.8 C85.8 29.8 84 31.6 84 34.6 C84 31.6 82.2 29.8 79.2 29.8 C82.2 29.8 84 28 84 25 Z"
                  fill="#2563EB"
                />

                {/* Bottom-Right Coral Star Sparkle */}
                <path
                  d="M78 57 C78 60.5 80 62.5 83.5 62.5 C80 62.5 78 64.5 78 68 C78 64.5 76 62.5 72.5 62.5 C76 62.5 78 60.5 78 57 Z"
                  fill="#F43F5E"
                />

                {/* Small Coral Dot */}
                <circle cx="21" cy="39" r="2.2" fill="#FB7185" />

                {/* Small Gold Star Dot Left */}
                <circle cx="27" cy="48" r="2" fill="#F59E0B" />

                {/* Small Gold Star Dot Right */}
                <circle cx="89" cy="44" r="2" fill="#F59E0B" />

                {/* 3D Green Sphere */}
                <circle cx="55" cy="46" r="24" fill="url(#glossyGreen)" filter="url(#softGlow)" />

                {/* Top-Left Gloss Highlight */}
                <ellipse cx="49" cy="32" rx="10" ry="4.5" fill="white" opacity="0.38" transform="rotate(-18 49 32)" />

                {/* White Checkmark */}
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
              Reset Link Sent Successfully!
            </h2>

            <p className="mt-2 text-xs text-slate-500 max-w-[280px] sm:max-w-[300px] mx-auto leading-relaxed">
              We have sent a password reset link to your registered email address, Please check your inbox.
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
