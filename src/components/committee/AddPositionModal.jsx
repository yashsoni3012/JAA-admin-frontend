'use client';

import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import Button from '@/components/common/Button';

export default function AddPositionModal({ open, onClose, onCreated }) {
  const [positionName, setPositionName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = positionName.trim();
    if (!trimmed) {
      setError('Position / Role name is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (onCreated) {
        await onCreated(trimmed);
      }
      setPositionName('');
      onClose();
    } catch (err) {
      console.error('Failed to create position:', err);
      setError(err.message || 'Failed to create position');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-3xl border border-white bg-white p-6 md:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
        {/* Header matching Image 2 */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-ink tracking-tight">
            Add New Position / Role
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input matching Image 2 */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              POSITION / ROLE NAME *
            </label>
            <input
              type="text"
              autoFocus
              value={positionName}
              onChange={(e) => {
                setPositionName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. President, Vice President, Secretary..."
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink placeholder:text-slate-400 shadow-xs focus:border-[#2832A4] focus:outline-none focus:ring-4 focus:ring-[#2832A4]/10 transition"
            />
          </div>

          {/* Action Buttons matching Image 2 */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-full border border-slate-300 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !positionName.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2832A4] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#2832A4]/25 hover:bg-[#20298a] transition disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Create Position</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

