'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { cn } from '@/lib/utils';

// Smooth slide-in drawer for screens smaller than lg (mobile & tablet)
export default function MobileSidebar({ open, onClose, onLogoutClick }) {
  // Prevent body scroll when drawer is open on mobile/tablet
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Close with the Escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 lg:hidden transition-all duration-300',
        open ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
      )}
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop with smooth fade transition */}
      <div
        className={cn(
          'fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 ease-out',
          open ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer with smooth slide-in transition */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-[280px] max-w-[85%] bg-[#EEF1FF] shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-10 flex flex-col overflow-hidden',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="absolute right-3.5 top-6 z-20 rounded-full p-2 text-slate-500 hover:text-slate-800 hover:bg-white/80 transition-all cursor-pointer active:scale-95"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="h-full flex-1 overflow-hidden">
          <AdminSidebar
            collapsed={false}
            onNavigate={onClose}
            onLogoutClick={() => {
              onClose();
              if (onLogoutClick) onLogoutClick();
            }}
          />
        </div>
      </aside>
    </div>
  );
}
