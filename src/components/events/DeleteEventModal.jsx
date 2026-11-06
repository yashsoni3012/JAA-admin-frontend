'use client';

import { useState } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { deleteEvent } from '@/services/event.service';

export default function DeleteEventModal({
  open,
  event,
  onClose,
  onDeleted,
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!open || !event) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError('');

    try {
      await deleteEvent(event.id);
      if (onDeleted) {
        onDeleted(event.id);
      }
      onClose();
    } catch (err) {
      console.error('Failed to delete event:', err);
      setError(err.message || 'Failed to delete event. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      maxWidth="max-w-md"
      headerBorder={false}
      headerClassName="hidden"
      bodyClassName="p-8 md:p-10 text-center"
    >
      <div className="flex flex-col items-center">
        {/* Trash Can Image */}
        <div className="relative mb-5 flex items-center justify-center">
          <img
            src="/uploads/trash-img.png"
            alt="Delete"
            className="h-28 w-28 object-contain drop-shadow-xl"
          />
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-[#FF3B3B] tracking-tight">
          Delete Event
        </h3>

        {/* Message */}
        <p className="mt-2.5 text-sm font-medium text-slate-500 max-w-xs leading-relaxed">
          Are you sure you want to delete this event?
        </p>

        {error && (
          <p className="mt-3 text-xs text-red-500 font-semibold">{error}</p>
        )}

        {/* Action Buttons Matching Image 3 */}
        <div className="mt-8 flex items-center justify-center gap-4 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 rounded-full border border-slate-200 bg-white px-7 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 shadow-xs"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 rounded-full bg-gradient-to-r from-[#FF3B3B] to-[#FF5A5F] px-7 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-500/25 transition hover:brightness-105 disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

