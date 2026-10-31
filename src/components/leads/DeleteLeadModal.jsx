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
        {/* 3D Glossy Red Trash Can with tilted lid, 3 radiating lines, and white 'X' badge on lower-left */}
        <div className="relative mb-5 flex items-center justify-center">
          <svg
            className="h-28 w-28 drop-shadow-xl"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="leadTrashBody" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FF4D4D" />
                <stop offset="50%" stopColor="#E60000" />
                <stop offset="100%" stopColor="#B30000" />
              </linearGradient>
              <linearGradient id="leadTrashLid" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FF6666" />
                <stop offset="100%" stopColor="#D90000" />
              </linearGradient>
              <linearGradient id="leadBadgeGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FF3333" />
                <stop offset="100%" stopColor="#990000" />
              </linearGradient>
              <filter id="leadShadow" x="-10%" y="-10%" width="120%" height="130%">
                <feDropShadow dx="0" dy="5" stdDeviation="5" floodOpacity="0.28" floodColor="#B30000" />
              </filter>
            </defs>

            {/* 3 Red Action Lines radiating outward to the right */}
            <path d="M84 28L94 25" stroke="#FF4D4D" strokeWidth="3" strokeLinecap="round" />
            <path d="M88 34L98 33" stroke="#FF4D4D" strokeWidth="3" strokeLinecap="round" />
            <path d="M85 41L94 43" stroke="#FF4D4D" strokeWidth="3" strokeLinecap="round" />

            {/* Trash Bin Lid (tilted slightly upward to the right) */}
            <g transform="rotate(-8 60 26)">
              {/* Lid Handle */}
              <path
                d="M48 20 C48 14, 72 14, 72 20"
                stroke="#FF4D4D"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              {/* Lid Rim */}
              <ellipse cx="60" cy="24" rx="34" ry="8" fill="url(#leadTrashLid)" filter="url(#leadShadow)" />
              <path d="M26 24 C26 22, 94 22, 94 24 L90 28 C90 30, 30 30, 30 28 Z" fill="#D60000" />
            </g>

            {/* Trash Bin Body */}
            <path
              d="M36 36 L43 98 C44 104, 76 104, 77 98 L84 36 Z"
              fill="url(#leadTrashBody)"
              filter="url(#leadShadow)"
            />

            {/* Vertical Ribs on Body */}
            <path d="M49 42 L52 94" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.35" />
            <path d="M60 42 L60 95" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.25" />
            <path d="M71 42 L68 94" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.35" />

            {/* Red Circle Badge with White 'X' on Front/Lower-Left */}
            <circle cx="50" cy="74" r="13" fill="url(#leadBadgeGrad)" stroke="#FFFFFF" strokeWidth="3" filter="url(#leadShadow)" />
            <line x1="44" y1="68" x2="56" y2="80" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />
            <line x1="56" y1="68" x2="44" y2="80" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />
          </svg>
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
