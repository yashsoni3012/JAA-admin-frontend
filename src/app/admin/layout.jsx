'use client';

import { usePathname } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import AdminLayout from '@/components/admin/AdminLayout';

// Every /admin/* route goes through auth guard. Public auth routes (forget/reset password) render cleanly without sidebar/topbar.
export default function AdminRootLayout({ children }) {
  const pathname = usePathname();

  const isPublicAuthRoute =
    pathname?.includes('/admin/forget-password') ||
    pathname?.includes('/admin/reset-password') ||
    pathname?.includes('/admin/forgot-password');

  if (isPublicAuthRoute) {
    return <AuthGuard>{children}</AuthGuard>;
  }

  return (
    <AuthGuard>
      <AdminLayout>{children}</AdminLayout>
    </AuthGuard>
  );
}
