'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';

// Slide-in drawer for screens smaller than lg.
export default function MobileSidebar({ open, onClose }) {
  // Close with the Escape key.
  useEffect(() => {
    if (!open) return;
    const handleKey = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  return (
    <div className={open ? 'fixed inset-0 z-50 lg:hidden' : 'hidden'} role={open ? 'dialog' : undefined} aria-modal={open ? 'true' : undefined}>
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden="true" />
      <aside className="absolute left-0 top-0 h-full w-[260px] max-w-[85%] bg-[#EEF1FF] shadow-xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="absolute right-4 top-6 rounded-full p-2 text-slate-500 hover:bg-white"
        >
          <X className="h-5 w-5" />
        </button>
        <AdminSidebar onNavigate={onClose} />
      </aside>
    </div>
  );
}
