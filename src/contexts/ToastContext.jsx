'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext({
  showToast: () => {},
  hideToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const pathname = usePathname();

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 4000) => {
    if (!message) return;
    setToast({ message, type, id: Date.now() });

    if (duration > 0) {
      setTimeout(() => {
        setToast((current) => (current?.message === message ? null : current));
      }, duration);
    }
  }, []);

  // Listen for route changes or initial load to display any flash message from sessionStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const flash = window.sessionStorage.getItem('flash_toast');
      if (flash) {
        window.sessionStorage.removeItem('flash_toast');
        const parsed = JSON.parse(flash);
        if (parsed?.message) {
          // Small delay so page transition completes and toast animates in nicely
          setTimeout(() => {
            showToast(parsed.message, parsed.type || 'success', parsed.duration || 4000);
          }, 150);
        }
      }
    } catch {
      // Ignore storage read errors
    }
  }, [pathname, showToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}

      {/* Global Popup Toast Container */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-5 right-5 sm:top-6 sm:right-6 z-[99999] flex items-center gap-3.5 rounded-2xl bg-[#1B1F3B] text-white px-5 py-4 shadow-2xl shadow-black/40 border border-slate-700/80 toast-enter max-w-md backdrop-blur-md"
        >
          {/* Icon based on type */}
          {toast.type === 'error' ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">
              <AlertCircle className="h-5 w-5 stroke-[2.5]" />
            </div>
          ) : toast.type === 'info' ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0">
              <Info className="h-5 w-5 stroke-[2.5]" />
            </div>
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
            </div>
          )}

          {/* Toast Message */}
          <div className="min-w-0 flex-1 pr-1">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              {toast.type === 'error' ? 'Notice' : toast.type === 'info' ? 'Info' : 'Success'}
            </p>
            <p className="text-sm font-semibold text-white leading-snug mt-0.5">
              {toast.message}
            </p>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={hideToast}
            aria-label="Close notification"
            className="ml-2 rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
}
