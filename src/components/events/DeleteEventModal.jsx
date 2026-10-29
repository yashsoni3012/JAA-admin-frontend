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
        {/* 3D Red Trash Can with 'X' badge graphic matching Image 3 */}
        <div className="relative mb-5 flex items-center justify-center">
          <svg
            className="h-28 w-28 drop-shadow-lg"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Trash Can Body Gradient */}
            <defs>
              <linearGradient id="trashBody" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FF4D4D" />
                <stop offset="60%" stopColor="#E60000" />
                <stop offset="100%" stopColor="#B30000" />
              </linearGradient>
              <linearGradient id="trashLid" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#FF6666" />
                <stop offset="100%" stopColor="#CC0000" />
              </linearGradient>
              <linearGradient id="badgeGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FF3333" />
                <stop offset="100%" stopColor="#990000" />
              </linearGradient>
              <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.25" floodColor="#B30000" />
              </filter>
            </defs>

            {/* Trash Bin Lid */}
            <ellipse cx="60" cy="30" rx="36" ry="10" fill="url(#trashLid)" filter="url(#shadow)" />
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
              fill="url(#trashBody)"
              filter="url(#shadow)"
            />

            {/* Vertical Ribs on Can */}
            <path d="M48 42 L52 95" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
            <path d="M60 42 L60 96" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.3" />
            <path d="M72 42 L68 95" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />

            {/* Red Circle Badge with White 'X' on Front */}
            <circle cx="60" cy="72" r="14" fill="url(#badgeGrad)" stroke="#FFFFFF" strokeWidth="3" />
            <line x1="53" y1="65" x2="67" y2="79" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
            <line x1="67" y1="65" x2="53" y2="79" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          </svg>
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

