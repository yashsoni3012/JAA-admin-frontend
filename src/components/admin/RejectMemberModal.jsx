'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Modal from '@/components/common/Modal';
import { cn } from '@/lib/utils';

export default function RejectMemberModal({ open, member, onClose, onConfirmReject }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (open) {
      setReason('');
      setError('');
      setIsSubmitting(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = reason.trim();
    if (!trimmed) {
      setError('Please provide a reason for rejection.');
      textareaRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    try {
      if (onConfirmReject) {
        await onConfirmReject(member, trimmed);
      }
      onClose();
    } catch (err) {
      console.error('Error rejecting member:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!member) return null;

  return (
    <Modal
      open={open}
      title="Reject Member"
      onClose={onClose}
      maxWidth="max-w-xl"
      headerBorder={false}
    >
      <form onSubmit={handleSubmit} noValidate className="px-6 pb-6 md:px-8 md:pb-8 pt-1">
        {/* Helper description text matching reference image */}
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          Please provide a reason for rejecting this member, This will help the member understand the issue.
        </p>

        {/* Rejection reason field */}
        <div>
          <label htmlFor="rejection-reason" className="block text-sm font-bold text-red-500 mb-2">
            Rejection Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            ref={textareaRef}
            id="rejection-reason"
            rows={5}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError('');
            }}
            placeholder="Enter reason for rejection..."
            className={cn(
              'w-full rounded-2xl bg-[#FFF5F5] p-4 text-sm text-ink placeholder:text-slate-400 transition resize-none',
              error
                ? 'border-2 border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                : 'border border-red-100 focus:border-red-400 focus:outline-none focus:ring-4 focus:ring-red-50'
            )}
          />
          {error && (
            <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex items-center justify-end gap-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-white px-7 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-slate-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-[#FF5B5B] bg-white px-6 py-2.5 text-sm font-semibold text-[#FF5B5B] hover:bg-red-50 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-red-100"
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Rejecting...</span>
              </>
            ) : (
              <>
                <X className="h-4 w-4 stroke-[2.5]" />
                <span>Reject Member</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
