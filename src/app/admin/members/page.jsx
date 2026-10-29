'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Upload,
  CheckCircle2,
  X,
} from 'lucide-react';
import { getMembers, createMember, updateMemberStatus, updateMember } from '@/services/admin.service';
import MemberRow from '@/components/admin/MemberRow';
import AddMemberModal from '@/components/admin/AddMemberModal';
import EditMemberModal from '@/components/admin/EditMemberModal';
import ViewMemberModal from '@/components/admin/ViewMemberModal';
import RejectMemberModal from '@/components/admin/RejectMemberModal';
import Button from '@/components/common/Button';
import EmptyState from '@/components/common/EmptyState';
import Loader from '@/components/common/Loader';
import { cn } from '@/lib/utils';

const TABS = ['All', 'Pending', 'Approved', 'Rejected'];
const PAGE_SIZES = [10, 20, 50];

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [counts, setCounts] = useState({
    all: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selected, setSelected] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [rejectingMember, setRejectingMember] = useState(null);
  const [toast, setToast] = useState(null);

  // Debounce search input by 350ms to prevent duplicate API requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Load server-side paginated members from backend API
  const loadMembers = useCallback(async (targetPage = 1, targetSize = 20, targetTab = 'All', targetSearch = '') => {
    setIsFetching(true);
    try {
      const data = await getMembers({
        page: targetPage,
        limit: targetSize,
        status: targetTab,
        search: targetSearch,
      });

      const list = data.members || (Array.isArray(data) ? data : []);
      setMembers(list);

      if (data.pagination) {
        setPagination({
          total: data.pagination.total ?? list.length,
          page: data.pagination.page ?? targetPage,
          limit: data.pagination.limit ?? targetSize,
          totalPages: data.pagination.totalPages ?? Math.max(1, Math.ceil((data.pagination.total ?? list.length) / targetSize)),
          hasNext: Boolean(data.pagination.hasNext),
          hasPrev: Boolean(data.pagination.hasPrev),
        });
      } else {
        const total = data.total ?? list.length;
        setPagination({
          total,
          page: targetPage,
          limit: targetSize,
          totalPages: Math.max(1, Math.ceil(total / targetSize)),
          hasNext: targetPage * targetSize < total,
          hasPrev: targetPage > 1,
        });
      }

      if (data.counts) {
        setCounts(data.counts);
      }
    } catch (err) {
      console.error('Failed to load members from API:', err);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, []);

  // Fetch from server whenever page, pageSize, activeTab, or debouncedSearch changes
  useEffect(() => {
    loadMembers(page, pageSize, activeTab, debouncedSearch);
  }, [loadMembers, page, pageSize, activeTab, debouncedSearch]);

  // Count shown in each tab label, e.g. "Pending(5)"
  const countFor = (tab) => {
    if (!counts) return 0;
    switch (tab) {
      case 'All':
        return counts.all ?? 0;
      case 'Pending':
        return counts.pending ?? 0;
      case 'Approved':
        return counts.approved ?? 0;
      case 'Rejected':
        return counts.rejected ?? 0;
      default:
        return 0;
    }
  };

  // Changing tabs or search resets to page 1
  const changeTab = (tab) => {
    if (tab === activeTab) return;
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

  // Pagination calculation
  const totalItems = pagination.total ?? 0;
  const totalPages = Math.max(1, pagination.totalPages ?? Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;

  // Window of up to 3 page numbers (e.g. 1 2 3)
  const windowStart = Math.max(1, Math.min(currentPage - 1, totalPages - 2));
  const pageNumbers = Array.from(
    { length: Math.min(3, totalPages) },
    (_, i) => windowStart + i
  );

  const handleAddMember = async (newMemberData) => {
    try {
      const created = await createMember(newMemberData);
      setToast(`Member "${created.name}" has been added successfully!`);
      setTimeout(() => setToast(null), 4500);
      // Reload current page and counts
      loadMembers(page, pageSize, activeTab, debouncedSearch);
    } catch (err) {
      console.error('Error creating member:', err);
      setToast(err.message || 'Failed to add member');
      setTimeout(() => setToast(null), 4500);
      throw err;
    }
  };

  const handleApprove = async (member) => {
    try {
      await updateMemberStatus(member.id, 'approved');
      setToast(`Member "${member.name}" has been approved!`);
      setTimeout(() => setToast(null), 4500);
      loadMembers(page, pageSize, activeTab, debouncedSearch);
    } catch (err) {
      console.error('Error approving member:', err);
      setToast(err.message || 'Failed to approve member');
      setTimeout(() => setToast(null), 4500);
    }
  };

  const handleConfirmReject = async (member, reason) => {
    try {
      await updateMemberStatus(member.id, 'rejected', reason);
      setToast(`Member "${member.name}" has been rejected.`);
      setTimeout(() => setToast(null), 4500);
      loadMembers(page, pageSize, activeTab, debouncedSearch);
    } catch (err) {
      console.error('Error rejecting member:', err);
      setToast(err.message || 'Failed to reject member');
      setTimeout(() => setToast(null), 4500);
    }
  };

  const handleMemberUpdated = (updatedMember) => {
    // Optimistically update the member in current table view
    setMembers((prev) =>
      prev.map((m) => (m.id === updatedMember.id ? { ...m, ...updatedMember } : m))
    );
    // If details modal was open for this member, sync it
    if (selected && selected.id === updatedMember.id) {
      setSelected((prev) => ({ ...prev, ...updatedMember }));
    }
    setToast(`Member "${updatedMember.name}" updated successfully.`);
    setTimeout(() => setToast(null), 4500);

    // Refresh from server to keep counts and pagination accurate
    loadMembers(page, pageSize, activeTab, debouncedSearch);
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
      {isFetching ? (
        <div className="flex justify-center py-16">
          <Loader label="Updating members..." />
        </div>
      ) : members.length === 0 ? (
        <EmptyState title="No members found" description="Try a different tab or search term." />
      ) : (
        <ul className="divide-y divide-slate-100">
          {members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              onView={setSelected}
              onEdit={(m) => setEditingMember(m)}
              onApprove={handleApprove}
              onReject={(m) => setRejectingMember(m)}
            />
          ))}
        </ul>
      )}

      {/* Footer: entry count, pagination, page size */}
      <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-5 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <p>
          Showing {totalItems === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + members.length, totalItems)} of{' '}
          {totalItems} entries
        </p>

        <div className="flex items-center gap-3">
          <nav aria-label="Pagination" className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isFetching}
              aria-label="Previous page"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {pageNumbers.map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setPage(num)}
                disabled={isFetching}
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
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || isFetching}
              aria-label="Next page"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 transition"
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

      {/* View Member details dialog */}
      <ViewMemberModal
        open={Boolean(selected)}
        member={selected}
        onClose={() => setSelected(null)}
        onEdit={(m) => setEditingMember(m)}
      />

      {/* Edit Member dialog */}
      <EditMemberModal
        open={Boolean(editingMember)}
        member={editingMember}
        onClose={() => setEditingMember(null)}
        onMemberUpdated={handleMemberUpdated}
      />

      {/* Reject Member dialog */}
      <RejectMemberModal
        open={Boolean(rejectingMember)}
        member={rejectingMember}
        onClose={() => setRejectingMember(null)}
        onConfirmReject={handleConfirmReject}
      />

      {/* Add Member dialog */}
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
