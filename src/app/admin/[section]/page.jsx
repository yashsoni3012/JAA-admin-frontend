'use client';

import { notFound, useParams } from 'next/navigation';
import PageHeader from '@/components/common/PageHeader';
import EmptyState from '@/components/common/EmptyState';

// Placeholder screens for the other sidebar items. Only these names are allowed.
const SECTIONS = {
  events: 'Events',
  messages: 'Messages',
  leads: 'Leads',
  complaints: 'Complaints',
  sos: 'SOS',
  committee: 'Committee',
  posts: 'Posts',
};

export default function AdminSectionPage({ params }) {
  const routeParams = useParams();
  const section = routeParams?.section || params?.section;
  const title = section ? SECTIONS[section] : null;

  if (!title) notFound();

  return (
    <div className="space-y-6">
      <PageHeader title={title} subtitle="This module is part of the next phase." />
      <section className="rounded-3xl border border-white bg-white shadow-card">
        <EmptyState title={`${title} module coming soon`} description="This screen is a placeholder in the current demo." />
      </section>
    </div>
  );
}
