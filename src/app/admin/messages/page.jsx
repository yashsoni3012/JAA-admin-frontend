'use client';

import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Messages" subtitle="Manage member broadcasts and message communications." />
      <section className="rounded-3xl border border-white bg-white shadow-card">
        <EmptyState title="Messages module coming soon" description="This screen is a placeholder in the current demo." />
      </section>
    </div>
  );
}

