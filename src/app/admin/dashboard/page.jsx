'use client';

import { useEffect, useState } from 'react';
import { Users, UserCheck, Clock, XCircle } from 'lucide-react';
import { getDashboardStats } from '@/services/admin.service';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/utils/formatDate';
import StatCard from '@/components/admin/StatCard';
import DashboardChart from '@/components/admin/DashboardChart';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import Loader from '@/components/common/Loader';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let active = true;
    getDashboardStats().then((data) => {
      if (active) setStats(data);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!stats) {
    return (
      <div className="flex justify-center py-24">
        <Loader label="Loading dashboard" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink md:text-2xl">Welcome back, {user?.name}</h2>
        <p className="mt-1 text-sm text-slate-500">Here is a sample overview of member activity.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Members" value={stats.total} icon={Users} accent="brand" />
        <StatCard label="Approved" value={stats.approved} icon={UserCheck} accent="green" />
        <StatCard label="Pending" value={stats.pending} icon={Clock} accent="amber" />
        <StatCard label="Rejected" value={stats.rejected} icon={XCircle} accent="red" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-3xl border border-white bg-white p-6 shadow-card xl:col-span-2">
          <h3 className="font-bold text-ink">Monthly sign-ups</h3>
          <p className="text-xs text-slate-500">Sample data for illustration only</p>
          <DashboardChart values={stats.monthly} />
        </section>

        <section className="rounded-3xl border border-white bg-white p-6 shadow-card">
          <h3 className="font-bold text-ink">Recent activity</h3>
          <ul className="mt-4 space-y-4">
            {stats.recent.map((member) => (
              <li key={member.id} className="flex items-center gap-3">
                <Avatar name={member.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{member.name}</p>
                  <p className="truncate text-xs text-slate-500">Joined {formatDate(member.joinedOn)}</p>
                </div>
                <Badge status={member.status} />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="overflow-hidden rounded-3xl border border-white bg-white shadow-card">
        <div className="px-6 py-5">
          <h3 className="font-bold text-ink">Recent members</h3>
        </div>
        {/* Horizontal scroll on small screens keeps the table usable */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-6 py-3 font-semibold">Name</th>
                <th scope="col" className="px-6 py-3 font-semibold">Business</th>
                <th scope="col" className="px-6 py-3 font-semibold">Email</th>
                <th scope="col" className="px-6 py-3 font-semibold">Joined</th>
                <th scope="col" className="px-6 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats.recent.map((member) => (
                <tr key={member.id} className="hover:bg-brand-50/40">
                  <td className="px-6 py-4 font-semibold text-ink">{member.name}</td>
                  <td className="px-6 py-4 text-slate-600">{member.business}</td>
                  <td className="px-6 py-4 text-slate-600">{member.email}</td>
                  <td className="px-6 py-4 text-slate-600">{formatDate(member.joinedOn)}</td>
                  <td className="px-6 py-4"><Badge status={member.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
