'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Accessible dialog: closes on Escape and on backdrop click.
export default function Modal({
  open,
  title,
  onClose,
  children,
  maxWidth = 'max-w-lg',
  className,
  bodyClassName,
  headerClassName,
  showCloseButton = true,
  headerBorder = true,
}) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Box */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={cn(
          'relative w-full rounded-2xl md:rounded-3xl bg-white shadow-2xl transition-all my-auto',
          'max-h-[92vh] flex flex-col',
          maxWidth,
          className
        )}
      >
        {/* Header matching reference image */}
        {title && (
          <div
            className={cn(
              'flex items-center justify-between px-6 py-5 md:px-8 md:py-6 shrink-0',
              headerBorder ? 'border-b border-slate-100' : 'pb-2',
              headerClassName
            )}
          >
            <h2 id="modal-title" className="text-xl md:text-2xl font-bold text-ink">
              {title}
            </h2>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500 hover:text-ink hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-200"
              >
                <X className="h-5 w-5 stroke-[2]" />
              </button>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className={cn('overflow-y-auto no-scrollbar flex-1', bodyClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
}

