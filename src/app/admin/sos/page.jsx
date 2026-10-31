'use client';

import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';

export default function SosPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="SOS" subtitle="Emergency alerts and instant member assistance requests." />
      <section className="rounded-3xl border border-white bg-white shadow-card">
        <EmptyState title="SOS module coming soon" description="This screen is a placeholder in the current demo." />
      </section>
    </div>
  );
}

