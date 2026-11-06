'use client';

import { useState } from 'react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';

export default function DeletePositionModal({
  open,
  title = 'Delete Position',
  description = 'Are you sure you want to delete this position?',
  confirmLabel = 'Delete',
  onClose,
  onConfirm,
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError('');
    try {
      if (onConfirm) await onConfirm();
      onClose();
    } catch (err) {
      console.error('Action failed:', err);
      setError(err.message || 'Action failed. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={isDeleting ? () => {} : onClose}
      maxWidth="max-w-[420px]"
      headerBorder={false}
      headerClassName="hidden"
      className="rounded-3xl border border-slate-100 shadow-2xl overflow-hidden"
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

        {/* Modal Title matching Image 3 */}
        <h3 className="text-2xl font-bold text-[#FF3B3B] tracking-tight">
          {title}
        </h3>

        {/* Modal Description */}
        <p className="mt-2.5 text-sm md:text-[15px] font-normal text-slate-500 leading-relaxed max-w-[290px]">
          {description}
        </p>

        {error && (
          <div className="mt-3 w-full rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        {/* Actions: Cancel and Confirm (with clear white text on gradient red button) */}
        <div className="mt-8 flex items-center justify-center gap-3 w-full">
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={onClose}
            className="flex-1 rounded-full border border-slate-300 bg-white py-2.5 px-6 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition shadow-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            disabled={isDeleting}
            loading={isDeleting}
            onClick={handleConfirm}
            className="flex-1 rounded-full bg-gradient-to-r from-[#FF3B3B] to-[#FF2424] hover:brightness-105 active:scale-95 text-white font-semibold text-sm py-2.5 px-6 shadow-md shadow-red-500/30 transition border-transparent"
          >
            <span>{confirmLabel}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
