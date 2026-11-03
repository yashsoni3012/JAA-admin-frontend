'use client';

import { useCallback, useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Upload,
  CheckCircle2,
  X,
} from 'lucide-react';
import { getMembers, createMember, updateMemberStatus, updateMember, deleteMember } from '@/services/admin.service';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import { cn } from '@/lib/utils';

// Lazy-loaded components for optimal performance and chunk splitting
const MemberRow = dynamic(() => import('@/components/admin/MemberRow'), {
  ssr: false,
  loading: () => (
    <li className="p-4 sm:p-5 flex items-center justify-center text-xs text-slate-400">
      Loading member...
    </li>
  ),
});

const AddMemberModal = dynamic(() => import('@/components/admin/AddMemberModal'), {
  ssr: false,
  loading: () => <Loader label="Loading form..." />,
});

const EditMemberModal = dynamic(() => import('@/components/admin/EditMemberModal'), {
  ssr: false,
  loading: () => <Loader label="Loading editor..." />,
});

const ViewMemberModal = dynamic(() => import('@/components/admin/ViewMemberModal'), {
  ssr: false,
  loading: () => <Loader label="Loading member details..." />,
});

const RejectMemberModal = dynamic(() => import('@/components/admin/RejectMemberModal'), {
  ssr: false,
  loading: () => <Loader label="Loading..." />,
});

const MemberIdCardModal = dynamic(() => import('@/components/members/MemberIdCardModal'), {
  ssr: false,
  loading: () => <Loader label="Loading ID Card..." />,
});

const ImportMembersModal = dynamic(() => import('@/components/admin/ImportMembersModal'), {
  ssr: false,
  loading: () => <Loader label="Loading import tool..." />,
});

const DeleteMemberModal = dynamic(() => import('@/components/admin/DeleteMemberModal'), {
  ssr: false,
  loading: () => <Loader label="Loading..." />,
});

const EmptyState = dynamic(() => import('@/components/common/EmptyState'), {
  ssr: false,
});

const TABS = ['All', 'Pending', 'Approved', 'Rejected'];
const PAGE_SIZES = [10, 20, 50];

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    total_items: 0,
    page: 1,
    current_page: 1,
    limit: 20,
    item_per_page: 20,
    totalPages: 1,
    total_page: 1,
    hasNext: false,
    has_more: false,
    hasPrev: false,
    has_prev: false,
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
  const [idCardMember, setIdCardMember] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [rejectingMember, setRejectingMember] = useState(null);
  const [deletingMember, setDeletingMember] = useState(null);
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

      const rawPagination = data.pagination || {};
      const totalItems =
        rawPagination.total_items !== undefined
          ? rawPagination.total_items
          : rawPagination.total !== undefined
          ? rawPagination.total
          : data.total !== undefined
          ? data.total
          : list.length;

      const totalPages =
        rawPagination.total_page !== undefined
          ? rawPagination.total_page
          : rawPagination.totalPages !== undefined
          ? rawPagination.totalPages
          : Math.max(1, Math.ceil(totalItems / targetSize));

      const currentPage =
        rawPagination.current_page !== undefined
          ? rawPagination.current_page
          : rawPagination.page !== undefined
          ? rawPagination.page
          : targetPage;

      const itemPerPage =
        rawPagination.item_per_page !== undefined
          ? rawPagination.item_per_page
          : rawPagination.limit !== undefined
          ? rawPagination.limit
          : targetSize;

      const hasNext = Boolean(
        rawPagination.has_more !== undefined
          ? rawPagination.has_more
          : rawPagination.hasNext !== undefined
          ? rawPagination.hasNext
          : currentPage < totalPages
      );

      const hasPrev = Boolean(
        rawPagination.has_prev !== undefined
          ? rawPagination.has_prev
          : rawPagination.hasPrev !== undefined
          ? rawPagination.hasPrev
          : currentPage > 1
      );

      setPagination({
        total: totalItems,
        total_items: totalItems,
        page: currentPage,
        current_page: currentPage,
        limit: itemPerPage,
        item_per_page: itemPerPage,
        totalPages,
        total_page: totalPages,
        hasNext,
        hasPrev,
        has_more: hasNext,
      });

      if (data.counts) {
        setCounts(data.counts);
      }
    } catch (err) {
      console.warn('Failed to load members from API:', err.message);
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
        return counts.all ?? counts.All ?? 0;
      case 'Pending':
        return counts.pending ?? counts.Pending ?? 0;
      case 'Approved':
        return counts.approved ?? counts.Approved ?? 0;
      case 'Rejected':
        return counts.rejected ?? counts.Rejected ?? 0;
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
  const totalItems = pagination.total_items ?? pagination.total ?? 0;
  const totalPages = Math.max(1, pagination.total_page ?? pagination.totalPages ?? Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + members.length, totalItems);

  // Dynamic window of up to 5 page numbers (e.g. 1 2 3 4 5)
  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = startPage + maxButtons - 1;
  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - maxButtons + 1);
  }
  const pageNumbers = Array.from(
    { length: Math.max(1, endPage - startPage + 1) },
    (_, i) => startPage + i
  );

  const handleAddMember = async (newMemberData) => {
    try {
      const created = await createMember(newMemberData);
      setToast(`Member "${created.name}" has been added successfully!`);
      setTimeout(() => setToast(null), 4500);
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
    setMembers((prev) =>
      prev.map((m) => (m.id === updatedMember.id ? { ...m, ...updatedMember } : m))
    );
    if (selected && selected.id === updatedMember.id) {
      setSelected((prev) => ({ ...prev, ...updatedMember }));
    }
    setToast(`Member "${updatedMember.name}" updated successfully.`);
    setTimeout(() => setToast(null), 4500);
    loadMembers(page, pageSize, activeTab, debouncedSearch);
  };

  const handleDeleteMember = async (memberId) => {
    try {
      await deleteMember(memberId);
      setToast('Member deleted successfully.');
      setTimeout(() => setToast(null), 4500);
      setDeletingMember(null);
      loadMembers(page, pageSize, activeTab, debouncedSearch);
    } catch (err) {
      console.error('Error deleting member:', err);
      setToast(err.message || 'Failed to delete member');
      setTimeout(() => setToast(null), 4500);
      throw err;
    }
  };



  return (
    <section className="rounded-2xl border border-white bg-white shadow-card sm:rounded-3xl overflow-hidden">
      {/* Header: title + actions (Responsive across mobile, tablet, desktop) */}
      <div className="flex flex-col gap-3.5 px-4 pb-4 pt-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pt-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-ink">Members</h2>
          <p className="text-xs text-slate-400 mt-0.5 sm:hidden">
            {totalItems} total registered members
          </p>
        </div>

        {/* Action Buttons: side-by-side grid on mobile, auto-width row on tablet/desktop */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center sm:gap-3">
          <Button
            variant="outline"
            onClick={() => setIsImportOpen(true)}
            className="w-full sm:w-auto justify-center rounded-full px-4 sm:px-6 text-xs sm:text-sm py-2 sm:py-2.5 cursor-pointer hover:bg-slate-50 transition"
          >
            <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
            <span>Import</span>
          </Button>
          <Button
            variant="primary"
            className="w-full sm:w-auto justify-center rounded-full px-4 sm:px-6 text-xs sm:text-sm py-2 sm:py-2.5 shadow-md shadow-brand-500/20 cursor-pointer"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
            <span>Add Member</span>
          </Button>
        </div>
      </div>

      {/* Status tabs (Touch scroll on mobile with hidden scrollbar) */}
      <div
        role="tablist"
        aria-label="Filter members by status"
        className="no-scrollbar flex gap-4 sm:gap-7 overflow-x-auto border-b border-slate-100 px-4 sm:px-6"
      >
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
                'relative shrink-0 pb-3 sm:pb-3.5 text-xs sm:text-sm font-medium transition cursor-pointer select-none',
                isActive ? 'font-bold text-brand-500' : 'text-slate-500 hover:text-ink'
              )}
            >
              <span>{tab}</span>
              <span className={cn(
                'ml-1.5 inline-block text-[11px] sm:text-xs px-1.5 py-0.5 rounded-full font-semibold',
                isActive ? 'bg-brand-50 text-brand-600' : 'bg-slate-100 text-slate-500'
              )}>
                {countFor(tab)}
              </span>
              {isActive && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3.5 sm:px-6 sm:py-4">
        <label className="relative block w-full max-w-xl">
          <span className="sr-only">Search members</span>
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => changeSearch(e.target.value)}
            placeholder="Search by name, business, mobile, membership ID..."
            className="w-full rounded-full border border-slate-200 bg-white py-2.5 sm:py-3 pl-11 pr-4 text-xs sm:text-sm text-ink placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100 transition shadow-2xs"
          />
        </label>
      </div>

      {/* Table & List Wrapper */}
      <div className="w-full">
        {/* Table Column Header: visible on Tablet (md:) and Desktop */}
        <div className="hidden md:grid grid-cols-12 gap-4 border-t border-b border-slate-100 bg-[#F8FAFC] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-500">
          <div className="col-span-4">Member</div>
          <div className="col-span-3">Contact Info</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3 text-right">Actions</div>
        </div>

        {/* Member list (Card view on mobile, structured row on tablet & desktop) */}
        {(isFetching || (isLoading && members.length === 0)) ? (
          <div className="flex justify-center py-16">
            <Loader label="Loading members..." />
          </div>
        ) : members.length === 0 ? (
          <Suspense fallback={<div className="py-12 text-center text-xs text-slate-400">Loading...</div>}>
            <EmptyState
              title="No members found"
              description="Try selecting a different status tab or adjusting your search term."
            />
          </Suspense>
        ) : (
          <ul className="divide-y divide-slate-100">
            {members.map((member) => (
              <Suspense
                key={member.id}
                fallback={
                  <li className="p-4 sm:p-5 flex items-center justify-center text-xs text-slate-400">
                    Loading member...
                  </li>
                }
              >
                <MemberRow
                  member={member}
                  onView={setSelected}
                  onIdCard={setIdCardMember}
                  onEdit={(m) => setEditingMember(m)}
                  onApprove={handleApprove}
                  onReject={(m) => setRejectingMember(m)}
                  onDelete={(m) => setDeletingMember(m)}
                />
              </Suspense>
            ))}
          </ul>
        )}
      </div>

      {/* Footer: entry count, pagination, page size (fully responsive) */}
      <div className="flex flex-col gap-3.5 border-t border-slate-100 px-4 py-4 sm:px-6 sm:py-5 text-xs sm:text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <p className="text-center sm:text-left">
          Showing <span className="font-semibold text-slate-700">{totalItems === 0 ? 0 : startIndex + 1}</span> to{' '}
          <span className="font-semibold text-slate-700">{endIndex}</span> of{' '}
          <span className="font-semibold text-slate-700">{totalItems}</span> entries
        </p>

        <div className="flex flex-wrap items-center justify-center sm:justify-between md:justify-end gap-3 w-full md:w-auto">
          {/* Pagination Navigation */}
          <nav aria-label="Pagination" className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || isFetching}
              aria-label="Previous page"
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 transition shadow-2xs"
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
                  'flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border text-xs sm:text-sm font-semibold transition shadow-2xs',
                  num === currentPage
                    ? 'border-transparent bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-sm'
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
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 transition shadow-2xs"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>

          {/* Rows per page dropdown */}
          <div className="flex items-center gap-1.5">
            <label className="sr-only" htmlFor="page-size">
              Rows per page
            </label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(e) => changePageSize(Number(e.target.value))}
              className="rounded-full border border-slate-200 bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-600 focus:border-brand-500 focus:outline-none shadow-2xs"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}/ page
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* View Member details dialog */}
      <Suspense fallback={<Loader label="Loading member details..." />}>
        {selected && (
          <ViewMemberModal
            open={Boolean(selected)}
            member={selected}
            onClose={() => setSelected(null)}
            onEdit={(m) => setEditingMember(m)}
            onViewIdCard={(m) => setIdCardMember(m)}
          />
        )}
      </Suspense>

      {/* Member ID Card dialog */}
      <Suspense fallback={<Loader label="Loading ID Card..." />}>
        {idCardMember && (
          <MemberIdCardModal
            open={Boolean(idCardMember)}
            member={idCardMember}
            onClose={() => setIdCardMember(null)}
          />
        )}
      </Suspense>

      {/* Edit Member dialog */}
      <Suspense fallback={<Loader label="Loading editor..." />}>
        {editingMember && (
          <EditMemberModal
            open={Boolean(editingMember)}
            member={editingMember}
            onClose={() => setEditingMember(null)}
            onMemberUpdated={handleMemberUpdated}
          />
        )}
      </Suspense>

      {/* Reject Member dialog */}
      <Suspense fallback={<Loader label="Loading..." />}>
        {rejectingMember && (
          <RejectMemberModal
            open={Boolean(rejectingMember)}
            member={rejectingMember}
            onClose={() => setRejectingMember(null)}
            onConfirmReject={handleConfirmReject}
          />
        )}
      </Suspense>

      {/* Delete Member dialog */}
      <Suspense fallback={<Loader label="Loading..." />}>
        {deletingMember && (
          <DeleteMemberModal
            open={Boolean(deletingMember)}
            member={deletingMember}
            onClose={() => setDeletingMember(null)}
            onConfirm={handleDeleteMember}
          />
        )}
      </Suspense>

      {/* Add Member dialog */}
      <Suspense fallback={<Loader label="Loading form..." />}>
        {isAddOpen && (
          <AddMemberModal
            open={isAddOpen}
            onClose={() => setIsAddOpen(false)}
            onAddMember={handleAddMember}
          />
        )}
      </Suspense>

      {/* Import Members dialog */}
      <Suspense fallback={<Loader label="Loading import tool..." />}>
        {isImportOpen && (
          <ImportMembersModal
            open={isImportOpen}
            members={members}
            onClose={() => setIsImportOpen(false)}
            onImportSuccess={() => {
              loadMembers(page, pageSize, activeTab, debouncedSearch);
            }}
          />
        )}
      </Suspense>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-4 left-4 right-4 z-50 flex items-center gap-3 rounded-2xl bg-[#1B1F3B] px-5 py-3.5 text-white shadow-2xl animate-in slide-in-from-bottom-4 duration-300 sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-md">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
          <span className="min-w-0 flex-1 text-xs sm:text-sm font-medium">{toast}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </section>
  );
}
