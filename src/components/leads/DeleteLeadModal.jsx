'use client';

import { useState } from 'react';
import Modal from '@/components/common/Modal';

export default function DeleteLeadModal({
  open,
  lead,
  onClose,
  onConfirm,
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!open || !lead) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError('');
    try {
      if (onConfirm) {
        await onConfirm(lead.id);
      }
      onClose();
    } catch (err) {
      console.error('Failed to delete lead:', err);
      setError(err.message || 'Failed to delete lead. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      maxWidth="max-w-[440px]"
      showCloseButton={false}
      headerBorder={false}
      headerClassName="hidden"
      className="rounded-[28px] border border-slate-100 shadow-2xl overflow-hidden"
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

        {/* Modal Title matching Image */}
        <h3 className="text-2xl font-bold text-[#FF4D4D] tracking-tight">
          Delete Lead
        </h3>

        {/* Modal Description in red/pink tone matching Image */}
        <p className="mt-2.5 text-sm md:text-[15px] font-normal text-[#FF4D4D]/85 leading-relaxed max-w-[280px]">
          Are you sure you want to delete this lead?
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
            className="flex-1 rounded-full border border-slate-200 bg-white py-2.5 px-6 text-sm font-medium text-slate-600 hover:bg-slate-50 transition shadow-xs cursor-pointer active:scale-95"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 rounded-full bg-gradient-to-r from-[#FF4D4D] to-[#FF2D2D] hover:brightness-105 active:scale-95 text-white font-semibold text-sm py-2.5 px-6 shadow-lg shadow-red-500/30 transition border-0 flex items-center justify-center cursor-pointer"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
