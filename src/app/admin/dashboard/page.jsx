'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  UserPlus,
  Calendar,
  AlertCircle,
  ShieldCheck,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { getDashboardStats, DEFAULT_DASHBOARD_DATA } from '@/services/admin.service';
import { useAuth } from '@/hooks/useAuth';
import StatCard from '@/components/admin/StatCard';
import { CardSkeleton, TableSkeleton } from '@/components/common/Skeleton';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const {
    data: stats = DEFAULT_DASHBOARD_DATA,
    isLoading,
  } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    staleTime: 1000 * 60 * 3, // 3 minutes fresh cache
  });

  const membersData = stats?.members || DEFAULT_DASHBOARD_DATA.members;
  const upcomingEvents = stats?.upcomingEvents ?? DEFAULT_DASHBOARD_DATA.upcomingEvents;
  const newComplaints = stats?.newComplaints ?? DEFAULT_DASHBOARD_DATA.newComplaints;
  const recentComplaints = stats?.recentComplaints || DEFAULT_DASHBOARD_DATA.recentComplaints;
  const committeeMembers = stats?.committeeMembers || DEFAULT_DASHBOARD_DATA.committeeMembers;
  const recentPosts = stats?.recentPosts || DEFAULT_DASHBOARD_DATA.recentPosts;

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-xl font-bold text-ink md:text-2xl">
          Welcome back, {user?.name || 'Admin'}
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Here is your organization overview and latest updates.
        </p>
      </div>

      {/* Top 4 KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Members"
            value={membersData?.totalMembers ?? 0}
            icon={Users}
            accent="brand"
            href="/admin/members"
          />
          <StatCard
            label="New Member Requests"
            value={membersData?.newMemberRequests ?? 0}
            icon={UserPlus}
            accent="amber"
            href="/admin/members"
          />
          <StatCard
            label="Upcoming Events"
            value={upcomingEvents ?? 0}
            icon={Calendar}
            accent="green"
            href="/admin/events"
          />
          <StatCard
            label="New Complaints"
            value={newComplaints ?? 0}
            icon={AlertCircle}
            accent="red"
            href="/admin/complaints"
          />
        </div>
      )}

      {/* 2 Table Lists Side by Side: Recent Complaints & Committee Members */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Table: Recent Complaints */}
        <section className="rounded-3xl border border-white bg-white p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                  <AlertCircle className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-bold text-ink text-base md:text-lg">Recent Complaints</h2>
                  <p className="text-xs text-slate-400">Latest reported complaints</p>
                </div>
              </div>
              <Link
                href="/admin/complaints"
                className="group flex items-center gap-1 text-xs font-semibold text-[#2832A4] hover:text-[#4A57EA] transition"
              >
                <span>View All</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="py-4">
                <TableSkeleton rows={4} cols={3} />
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar mt-3">
                <table className="w-full text-left border-collapse min-w-[460px]">
                  <thead>
                    <tr className="bg-[#F4F7FF] text-slate-500 text-[11px] font-bold uppercase tracking-wider rounded-2xl">
                      <th scope="col" className="py-3 pl-4 pr-2 text-center rounded-l-2xl w-16">
                        Sr. No.
                      </th>
                      <th scope="col" className="py-3 px-3">
                        Complaint ID
                      </th>
                      <th scope="col" className="py-3 px-3">
                        Complaint By
                      </th>
                      <th scope="col" className="py-3 pl-3 pr-4 rounded-r-2xl">
                        Complaint Type
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80">
                    {recentComplaints.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-xs text-slate-400">
                          No recent complaints found
                        </td>
                      </tr>
                    ) : (
                      recentComplaints.map((c, idx) => (
                        <tr
                          key={c.complaintId || idx}
                          onClick={() => router.push('/admin/complaints')}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        >
                          <td className="py-3.5 pl-4 pr-2 text-center text-xs font-semibold text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-3.5 px-3">
                            <span className="inline-block rounded-md bg-indigo-50/80 px-2 py-0.5 text-xs font-semibold font-mono text-[#2832A4] group-hover:underline">
                              {c.complaintId}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-xs sm:text-sm font-medium text-slate-800">
                            {c.complaintBy}
                          </td>
                          <td className="py-3.5 pl-3 pr-4">
                            <span className="inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                              {c.complaintType}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Right Table: Committee Members */}
        <section className="rounded-3xl border border-white bg-white p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#EEF1FF] text-[#2832A4]">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-bold text-ink text-base md:text-lg">Committee Members</h2>
                  <p className="text-xs text-slate-400">Positions & member counts</p>
                </div>
              </div>
              <Link
                href="/admin/committee"
                className="group flex items-center gap-1 text-xs font-semibold text-[#2832A4] hover:text-[#4A57EA] transition"
              >
                <span>View All</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {isLoading ? (
              <div className="py-4">
                <TableSkeleton rows={4} cols={2} />
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar mt-3">
                <table className="w-full text-left border-collapse min-w-[360px]">
                  <thead>
                    <tr className="bg-[#F4F7FF] text-slate-500 text-[11px] font-bold uppercase tracking-wider rounded-2xl">
                      <th scope="col" className="py-3 pl-4 pr-2 text-center rounded-l-2xl w-16">
                        Sr. No.
                      </th>
                      <th scope="col" className="py-3 px-3">
                        Position Name
                      </th>
                      <th scope="col" className="py-3 pl-3 pr-4 text-right rounded-r-2xl">
                        Total Counts
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80">
                    {committeeMembers.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-xs text-slate-400">
                          No committee positions found
                        </td>
                      </tr>
                    ) : (
                      committeeMembers.map((comm, idx) => (
                        <tr
                          key={comm.positionName || idx}
                          onClick={() => router.push('/admin/committee')}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        >
                          <td className="py-3.5 pl-4 pr-2 text-center text-xs font-semibold text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-3.5 px-3 text-xs sm:text-sm font-semibold text-slate-800">
                            <div className="flex items-center gap-2.5">
                              <span className="h-2 w-2 rounded-full bg-[#2832A4] shrink-0" />
                              <span className="group-hover:text-[#2832A4] transition-colors">
                                {comm.positionName}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 pl-3 pr-4 text-right">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-[#2832A4]">
                              <Users className="h-3 w-3" />
                              <span>{comm.totalCounts}</span>
                              <span className="text-[11px] font-normal text-slate-500">
                                {comm.totalCounts === 1 ? 'member' : 'members'}
                              </span>
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Full Width Table List: Recent Posts */}
      <section className="rounded-3xl border border-white bg-white p-6 shadow-card">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <FileText className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-bold text-ink text-base md:text-lg">Recent Posts</h2>
              <p className="text-xs text-slate-400">Latest feed publications & notices</p>
            </div>
          </div>
          <Link
            href="/admin/posts"
            className="group flex items-center gap-1 text-xs font-semibold text-[#2832A4] hover:text-[#4A57EA] transition"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="py-4">
            <TableSkeleton rows={4} cols={2} />
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar mt-3">
            <table className="w-full text-left border-collapse min-w-[540px]">
              <thead>
                <tr className="bg-[#F4F7FF] text-slate-500 text-[11px] font-bold uppercase tracking-wider rounded-2xl">
                  <th scope="col" className="py-3 pl-4 pr-2 text-center rounded-l-2xl w-16">
                    Sr. No.
                  </th>
                  <th scope="col" className="py-3 px-3">
                    Post
                  </th>
                  <th scope="col" className="py-3 pl-3 pr-4 rounded-r-2xl">
                    Posted By
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {recentPosts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-xs text-slate-400">
                      No recent posts found
                    </td>
                  </tr>
                ) : (
                  recentPosts.map((p, idx) => (
                    <tr
                      key={idx}
                      onClick={() => router.push('/admin/posts')}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 pl-4 pr-2 text-center text-xs font-semibold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-3 text-xs sm:text-sm font-semibold text-slate-800">
                        <div className="flex items-center gap-2.5">
                          <FileText className="h-4 w-4 text-slate-400 shrink-0 group-hover:text-[#2832A4] transition-colors" />
                          <span className="truncate max-w-xl group-hover:text-[#2832A4] transition-colors">
                            {p.post}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 pl-3 pr-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <span>{p.postedBy}</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
