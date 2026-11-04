'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  User,
  Send,
  UserPlus,
  ArrowLeft,
  Edit3,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import Button from '@/components/common/Button';
import { TableSkeleton } from '@/components/common/Skeleton';
import { getBroadcasts } from '@/services/broadcast.service';
import { cn } from '@/lib/utils';

export default function GroupDetailsView({
  group,
  onBack,
  onEdit,
  onDelete,
  onToggleStatus,
  onSendBroadcast,
  onAddMembers,
}) {
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(group?.status !== false);
  const [broadcasts, setBroadcasts] = useState(
    Array.isArray(group?.recentBroadcasts) && group.recentBroadcasts.length > 0
      ? group.recentBroadcasts
      : []
  );
  const [loadingBroadcasts, setLoadingBroadcasts] = useState(false);

  useEffect(() => {
    let active = true;
    if (!group?.id) return;

    if (Array.isArray(group.recentBroadcasts) && group.recentBroadcasts.length > 0) {
      setBroadcasts(group.recentBroadcasts);
    }

    setLoadingBroadcasts(true);
    getBroadcasts({ groupId: group.id, limit: 20 })
      .then((res) => {
        if (!active) return;
        const list = res?.broadcasts || [];
        const matched = list.filter((b) => {
          const bGId = b.group_id?.id ?? b.groupId?.id ?? b.groupId;
          if (bGId !== undefined && bGId !== null) {
            return String(bGId) === String(group.id);
          }
          const target = (b.sendTo || b.sentTo || '').toLowerCase();
          return target === group.name?.toLowerCase() || target === group.groupName?.toLowerCase();
        });

        if (matched.length > 0) {
          setBroadcasts(matched);
        } else if (Array.isArray(group.recentBroadcasts) && group.recentBroadcasts.length > 0) {
          setBroadcasts(group.recentBroadcasts);
        } else {
          setBroadcasts([]);
        }
      })
      .catch((err) => {
        console.warn('Failed to load group broadcasts:', err);
      })
      .finally(() => {
        if (active) setLoadingBroadcasts(false);
      });

    return () => {
      active = false;
    };
  }, [group?.id, group?.name, group?.recentBroadcasts]);

  if (!group) return null;

  const handleToggle = async () => {
    if (isTogglingStatus) return;
    const nextStatus = !currentStatus;
    setCurrentStatus(nextStatus);
    setIsTogglingStatus(true);
    try {
      if (onToggleStatus) {
        await onToggleStatus(group.id);
      }
    } catch {
      // Revert if failed
      setCurrentStatus(!nextStatus);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const memberCount = group.memberCount || group.members?.length || 25;

  return (
    <div className="space-y-6">
      {/* Top Main Group Header Card matching Image 3 */}
      <section className="rounded-3xl border border-white bg-white p-5 sm:p-7 md:p-8 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: Icon + Group Title + Member count */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-[#EEF2FF] flex items-center justify-center shrink-0 text-[#2832A4] shadow-2xs">
              <Users className="h-7 w-7 stroke-[1.8]" />
            </div>

            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-ink truncate leading-tight">
                {group.name}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                {memberCount} Members
              </p>
            </div>
          </div>

          {/* Right: Edit + Delete + "Back to Groups" button matching Image 3 */}
          <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-auto w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onEdit(group)}
                title="Edit Group"
                aria-label="Edit Group"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all hover:border-[#2832A4] hover:text-[#2832A4] hover:bg-slate-50 hover:shadow-xs active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#2832A4]/20 cursor-pointer"
              >
                <Edit3 className="h-4 w-4 stroke-[2]" />
              </button>

              <button
                type="button"
                onClick={() => onDelete(group)}
                title="Delete Group"
                aria-label="Delete Group"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-white text-red-500 transition-all hover:border-red-400 hover:bg-red-50 hover:shadow-xs active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-100 cursor-pointer"
              >
                <Trash2 className="h-4 w-4 stroke-[2]" />
              </button>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="border-[#2832A4] text-[#2832A4] hover:bg-indigo-50/70 px-4 sm:px-5 py-2 text-xs sm:text-sm active:scale-95 shadow-2xs gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Groups</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Middle Two-Column Grid: About Group & Group Actions matching Image 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): About Group */}
        <section className="lg:col-span-7 rounded-3xl border border-white bg-white p-6 sm:p-7 shadow-card space-y-5">
          <h3 className="text-base sm:text-lg font-bold text-ink">
            About Group
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {group.description || group.about || 'This group includes all registered members for this section.'}
          </p>

          {/* 2x2 Details Grid matching Image 3 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* 1. Group Type */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 text-slate-400 border border-slate-100">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Group Type</p>
                <p className="text-xs sm:text-sm font-bold text-ink mt-0.5">
                  {group.groupType || 'All Members'}
                </p>
              </div>
            </div>

            {/* 2. Created on */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 text-slate-400 border border-slate-100">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Created on</p>
                <p className="text-xs sm:text-sm font-bold text-ink mt-0.5">
                  {group.createdOn || '12 December 2025'}
                </p>
              </div>
            </div>

            {/* 3. Created by */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center shrink-0 text-slate-400 border border-slate-100">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Created by</p>
                <p className="text-xs sm:text-sm font-bold text-ink mt-0.5">
                  {group.createdBy || 'Admin User'}
                </p>
              </div>
            </div>

            {/* 4. Status Toggle Switch matching Image 3 */}
            <div className="flex items-center gap-3">
              <div>
                <p className="text-[11px] font-medium text-slate-400">Status</p>
                <div className="mt-1 flex items-center gap-2.5">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={currentStatus}
                    onClick={handleToggle}
                    disabled={isTogglingStatus}
                    className={cn(
                      'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#2832A4] focus:ring-offset-2',
                      currentStatus ? 'bg-[#2832A4]' : 'bg-slate-300'
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                        currentStatus ? 'translate-x-5' : 'translate-x-0'
                      )}
                    />
                  </button>
                  <span className="text-xs font-semibold text-slate-600">
                    {currentStatus ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column (5 cols): Group Actions matching Image 3 */}
        <section className="lg:col-span-5 rounded-3xl border border-white bg-white p-6 sm:p-7 shadow-card space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-ink">
            Group Actions
          </h3>

          {/* Action 1: Send Broadcast */}
          <div
            onClick={onSendBroadcast}
            className="rounded-2xl border border-slate-100 p-4 hover:border-indigo-200 hover:bg-indigo-50/30 cursor-pointer transition flex items-center gap-3.5 group shadow-2xs"
          >
            <div className="h-11 w-11 rounded-full bg-[#EEF2FF] flex items-center justify-center shrink-0 text-[#2832A4] group-hover:scale-105 transition-transform">
              <Send className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-ink group-hover:text-[#2832A4] transition-colors truncate">
                Send Broadcast
              </h4>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                Send a message to all members in this group
              </p>
            </div>
          </div>

          {/* Action 2: Add Members */}
          <div
            onClick={onAddMembers}
            className="rounded-2xl border border-slate-100 p-4 hover:border-indigo-200 hover:bg-indigo-50/30 cursor-pointer transition flex items-center gap-3.5 group shadow-2xs"
          >
            <div className="h-11 w-11 rounded-full bg-[#EEF2FF] flex items-center justify-center shrink-0 text-[#2832A4] group-hover:scale-105 transition-transform">
              <UserPlus className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-ink group-hover:text-[#2832A4] transition-colors truncate">
                Add Members
              </h4>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                Add new members to this group
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Section: Recent Broadcast matching Image 3 */}
      <section className="rounded-3xl border border-white bg-white p-6 sm:p-7 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-base sm:text-lg font-bold text-ink">
            Recent Broadcast
          </h3>

          <button
            type="button"
            onClick={onSendBroadcast}
            className="text-xs sm:text-sm font-semibold text-[#2832A4] hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>

        {/* Broadcasts Table matching Image 3 */}
        {loadingBroadcasts && broadcasts.length === 0 ? (
          <div className="p-4 sm:p-6">
            <TableSkeleton rows={4} cols={5} />
          </div>
        ) : broadcasts.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-xs sm:text-sm text-slate-400">
              No broadcast messages sent to this group yet.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={onSendBroadcast}
              className="rounded-full border-[#2832A4] text-[#2832A4] hover:bg-indigo-50/70 text-xs font-semibold px-4 py-2"
            >
              Send First Broadcast
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-xs sm:text-sm">
              <thead className="bg-[#F8FAFC] text-[11px] sm:text-xs uppercase tracking-wider font-bold text-slate-500 border-b border-slate-100">
                <tr>
                  <th scope="col" className="px-5 py-3.5 font-bold">Title</th>
                  <th scope="col" className="px-5 py-3.5 font-bold">Message</th>
                  <th scope="col" className="px-5 py-3.5 font-bold">Sent On</th>
                  <th scope="col" className="px-5 py-3.5 font-bold">Sent To</th>
                  <th scope="col" className="px-5 py-3.5 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {broadcasts.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-5 py-4 font-bold text-ink whitespace-nowrap">
                      {b.title || b.broadcastTitle}
                    </td>
                    <td className="px-5 py-4 text-slate-500 max-w-xs truncate">
                      {b.message}
                    </td>
                    <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                      {b.sentOn}
                    </td>
                    <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                      {b.sendTo || b.sentTo || group.name}
                    </td>
                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border border-[#A6F4C5] bg-[#D1FADF]/70 text-[#027A48]">
                        Delivered
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

