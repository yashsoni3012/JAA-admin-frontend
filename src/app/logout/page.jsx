'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/contexts/ToastContext';
import { ROUTES } from '@/constants/routes';
import { Skeleton } from '@/components/common/Skeleton';

// Visiting /logout calls http://localhost:5000/api/admin/logout, clears session, and redirects to /login
export default function LogoutPage() {
  const { logout } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    // Set flash toast so it renders upon arrival at /login
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(
        'flash_toast',
        JSON.stringify({
          message: 'Logged out successfully!',
          type: 'success',
        })
      );
    }

    logout().finally(() => {
      if (mounted) {
        showToast('Logged out successfully!', 'success');
        router.replace(ROUTES.LOGIN);
      }
    });

    return () => {
      mounted = false;
    };
  }, [logout, router, showToast]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#EEF1FF]">
      <div className="space-y-3 text-center">
        <Skeleton className="h-8 w-44 rounded-xl mx-auto" />
        <Skeleton className="h-4 w-32 rounded-lg mx-auto" />
      </div>
    </main>
  );
}
