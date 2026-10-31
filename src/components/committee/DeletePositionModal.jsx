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
        {/* 3D Red Glossy Trash Can with White 'X' Badge matching Image 3 */}
        <div className="relative mb-5 flex items-center justify-center">
          <svg
            className="h-28 w-28 drop-shadow-xl"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="trashBodyGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FF4D4D" />
                <stop offset="60%" stopColor="#E60000" />
                <stop offset="100%" stopColor="#B30000" />
              </linearGradient>
              <linearGradient id="trashLidGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FF6666" />
                <stop offset="100%" stopColor="#CC0000" />
              </linearGradient>
              <linearGradient id="badgeGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FF3333" />
                <stop offset="100%" stopColor="#990000" />
              </linearGradient>
              <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="130%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.25" floodColor="#B30000" />
              </filter>
            </defs>

            {/* Trash Bin Lid */}
            <ellipse cx="60" cy="30" rx="36" ry="10" fill="url(#trashLidGradient)" filter="url(#shadowFilter)" />
            <path
              d="M50 25 C50 20, 70 20, 70 25"
              stroke="#FFFFFF"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              opacity="0.8"
            />
            <path
              d="M26 30 C26 27, 94 27, 94 30 L90 35 C90 37, 30 37, 30 35 Z"
              fill="#D60000"
            />

            {/* Trash Bin Body */}
            <path
              d="M32 36 L40 100 C41 106, 79 106, 80 100 L88 36 Z"
              fill="url(#trashBodyGradient)"
              filter="url(#shadowFilter)"
            />

            {/* Vertical Ribs on Can */}
            <path d="M48 42 L52 95" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
            <path d="M60 42 L60 96" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />
            <path d="M72 42 L68 95" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />

            {/* Red Circle Badge with White 'X' on Front */}
            <circle cx="60" cy="72" r="14" fill="url(#badgeGradient)" stroke="#FFFFFF" strokeWidth="3" filter="url(#shadowFilter)" />
            <line x1="53" y1="65" x2="67" y2="79" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
            <line x1="67" y1="65" x2="53" y2="79" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          </svg>
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
