'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/constants/routes';
import { AdminPageSkeleton, Skeleton } from '@/components/common/Skeleton';

// Wraps protected content. Ensures user is authenticated before viewing admin routes.
export default function AuthGuard({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isPublicAuthRoute =
    pathname?.includes('/admin/forget-password') ||
    pathname?.includes('/admin/reset-password') ||
    pathname?.includes('/admin/forgot-password') ||
    pathname?.includes('/admin/login') ||
    pathname === '/login';

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicAuthRoute) {
      router.replace(ROUTES.LOGIN);
    }
  }, [isLoading, isAuthenticated, isPublicAuthRoute, router]);

  if (isPublicAuthRoute) {
    return children;
  }

  // During page refresh / initial authentication check, render skeleton layout with animation instead of spinner
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-[#EEF1FF]">
        <aside className="sticky top-0 hidden h-screen shrink-0 lg:block w-[260px] bg-[#EEF1FF] p-6 space-y-4">
          <Skeleton className="h-10 w-36 rounded-xl" />
          <div className="space-y-2 mt-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-full" />
            ))}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col bg-[#EEF1FF]">
          <div className="h-20 px-8 flex items-center justify-between">
            <Skeleton className="h-6 w-32 rounded-lg" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-28 rounded-md" />
            </div>
          </div>
          <main className="flex-1 px-4 pb-8 md:px-8">
            <AdminPageSkeleton />
          </main>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EEF1FF]">
        <div className="space-y-3 text-center">
          <Skeleton className="h-8 w-48 rounded-xl mx-auto" />
          <Skeleton className="h-4 w-32 rounded-lg mx-auto" />
        </div>
      </div>
    );
  }

  return children;
}
