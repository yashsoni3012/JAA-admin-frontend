'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Upload,
  Phone,
  Mail,
  Building2,
  CalendarDays,
  CheckCircle2,
  X,
} from 'lucide-react';
import { getMembers, createMember, updateMemberStatus, MEMBERS } from '@/services/admin.service';
import { formatDate } from '@/utils/formatDate';
import MemberRow from '@/components/admin/MemberRow';
import AddMemberModal from '@/components/admin/AddMemberModal';
import ViewMemberModal from '@/components/admin/ViewMemberModal';
import RejectMemberModal from '@/components/admin/RejectMemberModal';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import Loader from '@/components/common/Loader';
import { cn } from '@/lib/utils';

const TABS = ['All', 'Pending', 'Approved', 'Rejected'];
const PAGE_SIZES = [10, 25, 50];

export default function MembersPage() {
  const [members, setMembers] = useState(MEMBERS ?? []);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [rejectingMember, setRejectingMember] = useState(null);
  const [toast, setToast] = useState(null);

  const loadMembers = useCallback(async () => {
    try {
      const data = await getMembers();
      if (Array.isArray(data) && data.length > 0) {
        setMembers(data);
      }
    } catch (err) {
      console.error('Failed to load members from API:', err);
    }
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  // Count shown in each tab label, e.g. "Pending(22)".
  const countFor = (tab) =>
    tab === 'All' ? members.length : members.filter((m) => m.status === tab).length;

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return members.filter((m) => {
      const matchesTab = activeTab === 'All' || m.status === activeTab;
      const matchesSearch =
        !query || [m.name, m.business, m.mobile].some((value) => value.toLowerCase().includes(query));
      return matchesTab && matchesSearch;
    });
  }, [members, activeTab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filtered.slice(startIndex, startIndex + pageSize);

  // Show a window of up to 3 page numbers, like the reference (1 2 3).
  const windowStart = Math.max(1, Math.min(currentPage - 1, totalPages - 2));
  const pageNumbers = Array.from({ length: Math.min(3, totalPages) }, (_, i) => windowStart + i);

  // Changing a filter always returns to page 1.
  const changeTab = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };
  const changeSearch = (value) => {
    setSearch(value);
    setPage(1);
  };
  const changePageSize = (size) => {
    setPageSize(size);
    setPage(1);
  };

  const updateStatus = useCallback((id, status, reason = '') => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status, rejectionReason: reason || m.rejectionReason } : m
      )
    );
    setSelected((prev) =>
      prev && prev.id === id ? { ...prev, status, rejectionReason: reason || prev.rejectionReason } : prev
    );
  }, []);

  const handleAddMember = async (newMemberData) => {
    try {
      const created = await createMember(newMemberData);
      setMembers((prev) => [created, ...prev]);
      setToast(`Member "${created.name}" has been added successfully!`);
      setTimeout(() => {
        setToast(null);
      }, 4500);
    } catch (err) {
      console.error('Error creating member:', err);
      setToast(err.message || 'Failed to add member');
      setTimeout(() => {
        setToast(null);
      }, 4500);
      throw err;
    }
  };

  const handleApprove = async (member) => {
    try {
      await updateMemberStatus(member.id, 'approved');
      updateStatus(member.id, 'Approved');
      setToast(`Member "${member.name}" has been approved!`);
      setTimeout(() => {
        setToast(null);
      }, 4500);
    } catch (err) {
      console.error('Error approving member:', err);
      setToast(err.message || 'Failed to approve member');
      setTimeout(() => {
        setToast(null);
      }, 4500);
    }
  };

  const handleConfirmReject = async (member, reason) => {
    try {
      await updateMemberStatus(member.id, 'rejected', reason);
      updateStatus(member.id, 'Rejected', reason);
      setToast(`Member "${member.name}" has been rejected.`);
      setTimeout(() => {
        setToast(null);
      }, 4500);
    } catch (err) {
      console.error('Error rejecting member:', err);
      setToast(err.message || 'Failed to reject member');
      setTimeout(() => {
        setToast(null);
      }, 4500);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader label="Loading members" />
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-white bg-white shadow-card">
      {/* Header: title + actions */}
      <div className="flex flex-col gap-4 px-6 pb-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-ink">Members</h2>
        <div className="flex flex-wrap gap-3">
          {/* UI only in this demo: no import/add backend yet */}
          <Button variant="outline" className="rounded-full px-6">
            <Upload className="h-4 w-4" aria-hidden="true" /> Import
          </Button>
          <Button
            variant="primary"
            className="px-6"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Add Member
          </Button>
        </div>
      </div>

      {/* Status tabs */}
      <div role="tablist" aria-label="Filter members by status" className="no-scrollbar flex gap-8 overflow-x-auto border-b border-slate-100 px-6">
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => changeTab(tab)}
              className={cn(
                'relative shrink-0 pb-4 text-sm font-medium transition',
                isActive ? 'font-semibold text-brand-500' : 'text-slate-500 hover:text-ink'
              )}
            >
              {tab}({countFor(tab)})
              {isActive && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand-500" />}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="px-6 py-5">
        <label className="relative block max-w-xl">
          <span className="sr-only">Search members</span>
          <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => changeSearch(e.target.value)}
            placeholder="Search by name, business, mobile..."
            className="w-full rounded-full border border-slate-200 bg-white py-3 pl-12 pr-5 text-sm text-ink placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
          />
        </label>
      </div>

      {/* Table Column Header with dedicated Status column */}
      <div className="hidden md:grid grid-cols-12 gap-4 border-t border-b border-slate-100 bg-[#F8FAFC] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
        <div className="col-span-4">Member</div>
        <div className="col-span-4">Contact Info</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>

      {/* Member list */}
      {pageItems.length === 0 ? (
        <EmptyState title="No members found" description="Try a different tab or search term." />
      ) : (
        <ul className="divide-y divide-slate-100">
          {pageItems.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              onView={setSelected}
              onApprove={handleApprove}
              onReject={(m) => setRejectingMember(m)}
            />
          ))}
        </ul>
      )}

      {/* Footer: entry count, pagination, page size */}
      <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-5 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <p>
          Showing {filtered.length === 0 ? 0 : startIndex + 1} to {startIndex + pageItems.length} of{' '}
          {filtered.length} entries
        </p>

        <div className="flex items-center gap-3">
          <nav aria-label="Pagination" className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {pageNumbers.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setPage(num)}
                aria-current={num === currentPage ? 'page' : undefined}
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition',
                  num === currentPage
                    ? 'border-transparent bg-gradient-to-br from-brand-500 to-brand-600 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                )}
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>

          <label className="sr-only" htmlFor="page-size">Rows per page</label>
          <select
            id="page-size"
            value={pageSize}
            onChange={(e) => changePageSize(Number(e.target.value))}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 focus:border-brand-500 focus:outline-none"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>{size}/ page</option>
            ))}
          </select>
        </div>
      </div>

      {/* View Member details dialog matching reference UI */}
      <ViewMemberModal
        open={Boolean(selected)}
        member={selected}
        onClose={() => setSelected(null)}
      />

      {/* Reject Member dialog matching reference UI */}
      <RejectMemberModal
        open={Boolean(rejectingMember)}
        member={rejectingMember}
        onClose={() => setRejectingMember(null)}
        onConfirmReject={handleConfirmReject}
      />

      {/* Add Member dialog matching reference UI */}
      <AddMemberModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddMember={handleAddMember}
      />

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#1B1F3B] text-white px-5 py-3.5 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toast}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  );
}
