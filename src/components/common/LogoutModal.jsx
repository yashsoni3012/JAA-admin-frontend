'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/contexts/ToastContext';
import { ROUTES } from '@/constants/routes';

export default function LogoutModal({ open, onClose }) {
  const router = useRouter();
  const { logout } = useAuth();
  const { showToast } = useToast();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!open) return null;

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(
          'flash_toast',
          JSON.stringify({
            message: 'Logged out successfully!',
            type: 'success',
          })
        );
      }
      showToast('Logging out...', 'info');
      await logout();
      if (onClose) onClose();
      router.replace(ROUTES.LOGIN);
    } catch (err) {
      console.error('Logout error:', err);
      showToast('Failed to logout. Please try again.', 'error');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={isLoggingOut ? () => {} : onClose}
      maxWidth="max-w-[420px]"
      className="rounded-3xl border border-slate-100 shadow-2xl"
      bodyClassName="p-8 md:p-10 text-center"
    >
      <div className="flex flex-col items-center">
        {/* 3D Red Glossy Circle with White Logout Icon */}
        <div className="relative mb-5 flex items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-b from-[#FF2F38] via-[#F0222B] to-[#D90F19] shadow-xl shadow-red-500/35 border-2 border-white/20">
            {/* White Logout Door & Arrow Icon */}
            <svg
              className="h-10 w-10 text-white translate-x-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </div>
        </div>

        {/* Title matching Image */}
        <h3 className="text-2xl md:text-[26px] font-bold text-[#EA384C] tracking-tight">
          Logout
        </h3>

        {/* Subtitle / Description matching Image */}
        <p className="mt-2 text-sm md:text-[15px] font-normal text-slate-500 leading-relaxed max-w-[270px]">
          Are you sure you want to logout from your account?
        </p>

        {/* Action Buttons: Cancel and Logout */}
        <div className="mt-8 flex items-center justify-center gap-4 w-full">
          {/* Cancel Button */}
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoggingOut}
            className="flex-1 rounded-full border border-slate-200 bg-white py-2.5 px-6 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-xs focus:ring-slate-100"
          >
            Cancel
          </Button>

          {/* Logout Button */}
          <Button
            type="button"
            variant="danger"
            onClick={handleConfirmLogout}
            disabled={isLoggingOut}
            loading={isLoggingOut}
            className="flex-1 rounded-full bg-gradient-to-r from-[#FF2E36] to-[#FF4E55] hover:brightness-105 border-transparent text-white font-semibold text-sm py-2.5 px-6 shadow-lg shadow-red-500/30 active:scale-95 transition-all"
          >
            Logout
          </Button>
        </div>
      </div>
    </Modal>
  );
}

