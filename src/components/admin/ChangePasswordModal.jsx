'use client';

import { useState, useEffect } from 'react';
import { Lock, KeyRound, Eye, EyeOff, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { adminChangePassword } from '@/services/auth.service';
import { useToast } from '@/contexts/ToastContext';

export default function ChangePasswordModal({ open, onClose }) {
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    setFormError('');
  };

  // Ensure fields are completely blank whenever modal opens and beat browser autofill
  useEffect(() => {
    if (open) {
      resetForm();
      const t1 = setTimeout(() => setCurrentPassword(''), 50);
      const t2 = setTimeout(() => setCurrentPassword(''), 150);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [open]);

  const handleClose = () => {
    if (!submitting) {
      resetForm();
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!currentPassword) {
      setFormError('Current password is required.');
      return;
    }

    if (!newPassword) {
      setFormError('New password is required.');
      return;
    }

    if (newPassword.length < 6) {
      setFormError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword === currentPassword) {
      setFormError('New password cannot be the same as your current password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('New password and confirm password do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await adminChangePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      showToast(result.message || 'Password changed successfully!', 'success');
      resetForm();
      onClose();
    } catch (err) {
      const msg = err.message || 'Failed to change password. Please check your current password.';
      setFormError(msg);
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const inputBase =
    'w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-ink placeholder:text-slate-400 transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100';

  const passwordsMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
  const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  return (
    <Modal
      open={open}
      title="Change Password"
      onClose={handleClose}
      maxWidth="max-w-md"
      bodyClassName="p-6 md:p-8"
    >
      <form
        key={open ? 'pw-modal-open' : 'pw-modal-closed'}
        onSubmit={handleSubmit}
        noValidate
        autoComplete="off"
        className="space-y-5"
      >
        {/* Hidden decoy fields to intercept aggressive browser password autofill */}
        <div
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
        >
          <input
            type="text"
            name="fake_username_decoy"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
          <input
            type="password"
            name="fake_password_decoy"
            tabIndex={-1}
            autoComplete="new-password"
            defaultValue=""
          />
        </div>

        <p className="text-xs text-slate-500 -mt-2">
          Ensure your account is using a secure and strong password with at least 6 characters.
        </p>

        {formError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 animate-in fade-in duration-200"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="font-medium text-xs leading-relaxed">{formError}</span>
          </div>
        )}

        {/* Current Password */}
        <div>
          <label
            htmlFor="currentPassword"
            className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600"
          >
            Current Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="currentPassword"
              name="current_password_unautofill"
              type={showCurrent ? 'text' : 'password'}
              required
              autoComplete="new-password"
              data-lpignore="true"
              data-1p-ignore="true"
              data-form-type="other"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                if (formError) setFormError('');
              }}
              placeholder="Enter current password"
              className={inputBase}
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md transition"
            >
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="newPassword"
              className="block text-xs font-bold uppercase tracking-wider text-slate-600"
            >
              New Password <span className="text-red-500">*</span>
            </label>
            {newPassword.length >= 6 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <CheckCircle2 className="h-3 w-3" />
                <span>Valid length</span>
              </span>
            )}
          </div>
          <div className="relative">
            <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="newPassword"
              name="newPassword"
              type={showNew ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (formError) setFormError('');
              }}
              placeholder="Enter new password (min. 6 characters)"
              className={inputBase}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              aria-label={showNew ? 'Hide new password' : 'Show new password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md transition"
            >
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {newPassword.length > 0 && newPassword.length < 6 && (
            <p className="mt-1 text-[11px] text-amber-600">
              Password must be at least 6 characters long ({newPassword.length}/6).
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-bold uppercase tracking-wider text-slate-600"
            >
              Confirm Password <span className="text-red-500">*</span>
            </label>
            {passwordsMatch && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <CheckCircle2 className="h-3 w-3" />
                <span>Passwords match</span>
              </span>
            )}
            {passwordsMismatch && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500">
                <AlertCircle className="h-3 w-3" />
                <span>Does not match</span>
              </span>
            )}
          </div>
          <div className="relative">
            <ShieldCheck className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (formError) setFormError('');
              }}
              placeholder="Confirm new password"
              className={inputBase}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-md transition"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={submitting}
            className="px-5 py-2 text-xs font-semibold rounded-full"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={submitting}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2 text-xs font-semibold rounded-full shadow-md shadow-blue-500/20"
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>{submitting ? 'Updating...' : 'Update Password'}</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
