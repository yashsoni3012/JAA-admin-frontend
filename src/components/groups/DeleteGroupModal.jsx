'use client';

import { useState } from 'react';
import Modal from '@/components/common/Modal';

export default function DeleteGroupModal({ open, group, onClose, onConfirm }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!open || !group) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError('');
    try {
      await onConfirm(group.id);
      onClose();
    } catch (err) {
      console.error('Failed to delete group:', err);
      setError(err?.message || 'Failed to delete group. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={isDeleting ? () => {} : onClose}
      maxWidth="max-w-[420px]"
      showCloseButton={false}
      headerBorder={false}
      headerClassName="hidden"
      className="rounded-3xl border border-slate-100 shadow-2xl overflow-hidden"
      bodyClassName="p-8 sm:p-10 text-center"
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

        {/* Modal Title matching Image */}
        <h3 className="text-2xl font-bold text-[#FF4D4D] tracking-tight">
          Delete Group
        </h3>

        {/* Modal Description in red/pink tone matching Image */}
        <p className="mt-2.5 text-sm md:text-[15px] font-normal text-[#FF4D4D]/85 leading-relaxed max-w-[280px]">
          Are you sure you want to delete this group?
        </p>

        {error && (
          <p className="mt-3 text-xs font-semibold text-red-600 bg-red-50 py-1.5 px-3 rounded-lg border border-red-200">
            {error}
          </p>
        )}

        {/* Action Buttons: Cancel and Delete pills matching Image */}
        <div className="mt-8 flex items-center justify-center gap-4 w-full max-w-xs">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 rounded-full border border-slate-200 bg-white py-2.5 px-6 text-sm font-medium text-slate-600 hover:bg-slate-50 transition shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 rounded-full bg-gradient-to-r from-[#FF4D4D] to-[#E60000] py-2.5 px-6 text-sm font-semibold text-white shadow-md shadow-red-500/25 hover:brightness-105 transition cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            <span>Delete</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
