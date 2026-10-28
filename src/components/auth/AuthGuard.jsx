'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import Loader from '@/components/common/Loader';

// Wraps protected content. Ensures user is authenticated before viewing admin routes.
export default function AuthGuard({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicAuthRoute =
    pathname?.includes('/admin/forget-password') ||
    pathname?.includes('/admin/reset-password') ||
    pathname?.includes('/admin/forgot-password');

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicAuthRoute) {
      router.replace(ROUTES.LOGIN);
    }
  }, [isLoading, isAuthenticated, isPublicAuthRoute, router]);


  if (isPublicAuthRoute) {
    return children;
  }


  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EEF1FF]">
        <Loader label="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EEF1FF]">
        <Loader label="Redirecting to login..." />
      </div>
    );
  }

  return children;
}
