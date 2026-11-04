'use client';

import { AdminPageSkeleton } from '@/components/common/Skeleton';

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#EEF1FF] p-4 sm:p-6 md:p-8">
      <AdminPageSkeleton />
    </main>
  );
}
