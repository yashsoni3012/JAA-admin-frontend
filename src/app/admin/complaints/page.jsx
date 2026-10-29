'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertCircle,
  X,
} from 'lucide-react';
import Avatar from '@/components/common/Avatar';
import Loader from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';
import ComplaintDetailsView from '@/components/complaints/ComplaintDetailsView';
import {
  getComplaints,
  getComplaintById,
  formatComplaintCode,
  getMediaUrl,
  isComplaintAgainstMember,
  isMemberEntity,
} from '@/services/complaint.service';
import { cn } from '@/lib/utils';

const PAGE_SIZES = [5, 10, 20, 50];

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [summary, setSummary] = useState({
    totalComplaints: 0,
    againstMember: 0,
    againstOther: 0,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Tab filter: 'ALL' | 'MEMBER' | 'OTHER'
  const [activeTab, setActiveTab] = useState('ALL');

  // Additional Filter Menu
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Detail View State (Image 2)
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Load complaints from backend API
  const loadComplaints = useCallback(
    async (targetPage = 1, targetSize = 10, targetSearch = '', targetStatus = 'ALL', targetPriority = 'ALL') => {
      setIsFetching(true);
      try {
        const res = await getComplaints({
          page: targetPage,
          limit: targetSize,
          search: targetSearch,
          status: targetStatus !== 'ALL' ? targetStatus : '',
          priority: targetPriority !== 'ALL' ? targetPriority : '',
        });

        setComplaints(res.complaints || []);
        if (res.summary) setSummary(res.summary);
        if (res.pagination) {
          setPagination({
            total: res.pagination.total ?? res.complaints.length,
            page: res.pagination.page ?? targetPage,
            limit: res.pagination.limit ?? targetSize,
            totalPages:
              res.pagination.totalPages ??
              Math.max(1, Math.ceil((res.pagination.total ?? res.complaints.length) / targetSize)),
          });
        }
      } catch (err) {
        console.error('Failed to load complaints:', err);
      } finally {
        setIsLoading(false);
        setIsFetching(false);
      }
    },
    []
  );

  useEffect(() => {
    loadComplaints(page, pageSize, debouncedSearch, statusFilter, priorityFilter);
  }, [loadComplaints, page, pageSize, debouncedSearch, statusFilter, priorityFilter]);

  // Handle clicking "View" button -> calls GET /api/admin/complaints/:id
  const handleViewComplaint = async (complaintItem) => {
    const id = complaintItem.complaintId ?? complaintItem.id ?? complaintItem.complaintNumber;
    setIsLoadingDetail(true);
    setDetailError('');

    try {
      const detail = await getComplaintById(id);
      setSelectedComplaint(detail);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Failed to load complaint details:', err);
      setDetailError(err.message || 'Failed to fetch complaint details.');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Filter complaints client-side by activeTab ('ALL', 'MEMBER', 'OTHER') and debouncedSearch
  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      const isMember = isComplaintAgainstMember(item);

      if (activeTab === 'MEMBER' && !isMember) return false;
      if (activeTab === 'OTHER' && isMember) return false;

      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase().trim();
        const code = (item.complaintNumber || formatComplaintCode(item.complaintId || item.id) || '').toLowerCase();
        const complainantName = (item.complaintBy?.name || '').toLowerCase();
        const complainantBiz = (item.complaintBy?.business || '').toLowerCase();
        const membershipId = (item.complaintBy?.membershipId || '').toLowerCase();
        const type = (item.complaintType || '').toLowerCase();
        const priority = (item.priority || '').toLowerCase();
        const status = (item.status || '').toLowerCase();
        const targetName = (
          item.targetMember?.name ||
          item.againstPerson?.name ||
          item.member?.name ||
          ''
        ).toLowerCase();
        const targetBiz = (
          item.targetMember?.business ||
          item.againstPerson?.company ||
          item.member?.business ||
          ''
        ).toLowerCase();

        const matches =
          code.includes(q) ||
          complainantName.includes(q) ||
          complainantBiz.includes(q) ||
          membershipId.includes(q) ||
          type.includes(q) ||
          priority.includes(q) ||
          status.includes(q) ||
          targetName.includes(q) ||
          targetBiz.includes(q);

        if (!matches) return false;
      }

      return true;
    });
  }, [complaints, activeTab, debouncedSearch]);

  // Compute counts for tabs
  const tabCounts = useMemo(() => {
    const all = summary.totalComplaints || complaints.length;
    let member = summary.againstMember || 0;
    let other = summary.againstOther || 0;

    if (!member && !other && complaints.length > 0) {
      member = complaints.filter((c) => isComplaintAgainstMember(c)).length;
      other = complaints.filter((c) => !isComplaintAgainstMember(c)).length;
    }

    return { all, member, other };
  }, [summary, complaints]);

  // Pagination calculation
  const totalItems = filteredComplaints.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedList = filteredComplaints.slice(startIndex, startIndex + pageSize);

  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  // Helper for priority pill styling matching Image 1
  const renderPriorityBadge = (priority) => {
    const p = String(priority || '').toLowerCase();
    if (p === 'high') {
      return (
        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-[#FFF1F2] text-[#E11D48] border border-[#FFE4E6]">
          High
        </span>
      );
    }
    if (p === 'medium') {
      return (
        <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-[#FFFBEB] text-[#D97706] border border-[#FEF3C7]">
          Medium
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]">
        Low
      </span>
    );
  };

  // Helper for status badge styling matching Image 1
  const renderStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'resolved') {
      return (
        <span className="inline-flex items-center px-3.5 py-0.5 rounded-full text-xs font-semibold border border-[#86EFAC] text-[#16A34A] bg-[#F0FDF4]/70">
          Resolved
        </span>
      );
    }
    if (s === 'in progress') {
      return (
        <span className="inline-flex items-center px-3.5 py-0.5 rounded-full text-xs font-semibold border border-[#93C5FD] text-[#2563EB] bg-[#EFF6FF]/70">
          In Progress
        </span>
      );
    }
    if (s === 'under review') {
      return (
        <span className="inline-flex items-center px-3.5 py-0.5 rounded-full text-xs font-semibold border border-[#C7D2FE] text-[#4F46E5] bg-[#EEF2FF]/70">
          Under Review
        </span>
      );
    }
    if (s === 'closed') {
      return (
        <span className="inline-flex items-center px-3.5 py-0.5 rounded-full text-xs font-semibold border border-[#FCA5A5] text-[#DC2626] bg-[#FEF2F2]/70">
          Closed
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3.5 py-0.5 rounded-full text-xs font-semibold border border-[#FCD34D] text-[#D97706] bg-[#FFFBEB]/70">
        Open
      </span>
    );
  };

  // If a complaint detail is open, show the ComplaintDetailsView matching Image 2
  if (selectedComplaint) {
    return (
      <ComplaintDetailsView
        complaint={selectedComplaint}
        onBack={() => setSelectedComplaint(null)}
        onStatusUpdated={(updated) => {
          setSelectedComplaint(updated);
          loadComplaints(page, pageSize, debouncedSearch, statusFilter, priorityFilter);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Detail error notification if fetch failed */}
      {detailError && (
        <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="font-medium">{detailError}</p>
          </div>
          <button onClick={() => setDetailError('')} className="text-red-400 hover:text-red-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Complaints Card matching Image 1 */}
      <section className="rounded-3xl border border-white bg-white p-6 md:p-8 shadow-card space-y-6">
        {/* Title */}
        <h2 className="text-xl md:text-2xl font-bold text-ink">
          Complaints
        </h2>

        {/* TABS ROW matching Image 1 */}
        <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar gap-8">
          <button
            type="button"
            onClick={() => {
              setActiveTab('ALL');
              setPage(1);
            }}
            className={cn(
              'pb-3.5 text-sm font-semibold transition whitespace-nowrap relative',
              activeTab === 'ALL'
                ? 'text-[#2832A4]'
                : 'text-slate-500 hover:text-slate-700 font-medium'
            )}
          >
            All Complaints ({tabCounts.all})
            {activeTab === 'ALL' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2832A4] rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('MEMBER');
              setPage(1);
            }}
            className={cn(
              'pb-3.5 text-sm font-semibold transition whitespace-nowrap relative',
              activeTab === 'MEMBER'
                ? 'text-[#2832A4]'
                : 'text-slate-500 hover:text-slate-700 font-medium'
            )}
          >
            Against Member ({tabCounts.member})
            {activeTab === 'MEMBER' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2832A4] rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('OTHER');
              setPage(1);
            }}
            className={cn(
              'pb-3.5 text-sm font-semibold transition whitespace-nowrap relative',
              activeTab === 'OTHER'
                ? 'text-[#2832A4]'
                : 'text-slate-500 hover:text-slate-700 font-medium'
            )}
          >
            Against Other ({tabCounts.other})
            {activeTab === 'OTHER' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2832A4] rounded-full" />
            )}
          </button>
        </div>

        {/* CONTROLS BAR: Search & Filters matching Image 1 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Complaint ID, name, type, priority..."
              className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-ink placeholder:text-slate-400 shadow-xs focus:border-[#2832A4] focus:outline-none focus:ring-4 focus:ring-[#2832A4]/10 transition"
            />
          </div>

          {/* Filters Button */}
          <div className="relative self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setShowFilterMenu((prev) => !prev)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition shadow-xs',
                statusFilter !== 'ALL' || priorityFilter !== 'ALL'
                  ? 'border-[#2832A4] bg-blue-50/60 text-[#2832A4]'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
              {(statusFilter !== 'ALL' || priorityFilter !== 'ALL') && (
                <span className="h-2 w-2 rounded-full bg-[#2832A4]" />
              )}
            </button>

            {/* Filters Dropdown */}
            {showFilterMenu && (
              <div className="absolute right-0 mt-2 z-30 w-56 rounded-2xl border border-slate-100 bg-white p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-150 space-y-3">
                <div>
                  <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Filter by Status
                  </p>
                  {['ALL', 'Open', 'In Progress', 'Under Review', 'Resolved', 'Closed'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setStatusFilter(st);
                        setShowFilterMenu(false);
                        setPage(1);
                      }}
                      className={cn(
                        'w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition',
                        statusFilter === st
                          ? 'bg-blue-50 text-[#2832A4]'
                          : 'text-slate-700 hover:bg-slate-50'
                      )}
                    >
                      {st === 'ALL' ? 'All Statuses' : st}
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-100 pt-2">
                  <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Filter by Priority
                  </p>
                  {['ALL', 'High', 'Medium', 'Low'].map((pr) => (
                    <button
                      key={pr}
                      type="button"
                      onClick={() => {
                        setPriorityFilter(pr);
                        setShowFilterMenu(false);
                        setPage(1);
                      }}
                      className={cn(
                        'w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition',
                        priorityFilter === pr
                          ? 'bg-blue-50 text-[#2832A4]'
                          : 'text-slate-700 hover:bg-slate-50'
                      )}
                    >
                      {pr === 'ALL' ? 'All Priorities' : `${pr} Priority`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* TABLE LIST matching Image 1 */}
        {isLoading && complaints.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader label="Loading complaints..." />
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title="No complaints found"
              description="No complaints match your current search or tab filters."
            />
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse min-w-[900px]">
              {/* Table Column Header matching Image 1 */}
              <thead>
                <tr className="bg-[#F4F7FF] text-slate-500 text-[11px] font-bold uppercase tracking-wider rounded-2xl">
                  <th className="py-3.5 pl-6 pr-4 rounded-l-2xl">COMPLAINTS ID</th>
                  <th className="py-3.5 px-4">COMPLAINT BY</th>
                  <th className="py-3.5 px-4">COMPLAINT TYPE</th>
                  <th className="py-3.5 px-4">PRIORITY</th>
                  <th className="py-3.5 px-4">STATUS</th>
                  {/* <th className="py-3.5 px-4">DATE & TIME</th> */}
                  <th className="py-3.5 pr-6 pl-4 text-center rounded-r-2xl">ACTIONS</th>
                </tr>
              </thead>

              {/* Table Body Rows matching Image 1 */}
              <tbody className="divide-y divide-slate-100 text-sm">
                {paginatedList.map((item, index) => {
                  const itemId = item.complaintId ?? item.id ?? item.complaintNumber ?? index;
                  const code = item.complaintNumber || formatComplaintCode(item);
                  const isComplainantMember = isMemberEntity(item.complaintBy);
                  const complainantName = item.complaintBy?.name || 'Complainant';
                  const businessName = item.complaintBy?.business || 'Jewellers';
                  const membershipId = isComplainantMember ? item.complaintBy?.membershipId : null;
                  const avatarUrl = getMediaUrl(item.complaintBy?.avatar);

                  return (
                    <tr
                      key={itemId}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* 1. Complaints ID */}
                      <td className="py-4 pl-6 pr-4 font-bold text-ink whitespace-nowrap">
                        {code}
                      </td>

                      {/* 2. Complaint By (Avatar + Name + Business) */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={complainantName}
                            src={avatarUrl}
                            size="md"
                            className="h-10 w-10 shrink-0 shadow-xs"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-ink truncate text-sm">
                              {complainantName}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {businessName}
                              {membershipId ? ` • ${membershipId}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 3. Complaint Type */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-medium bg-[#EEF2FF] text-[#2832A4] border border-[#D4DEFE]">
                          {item.complaintType || 'Payment Dispute'}
                        </span>
                      </td>

                      {/* 4. Priority */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {renderPriorityBadge(item.priority || item.complaintDetails?.priority)}
                      </td>

                      {/* 5. Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {renderStatusBadge(item.status)}
                      </td>

                      {/* 6. Date & Time */}
                      {/* <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-600 font-medium">
                        {item.createdAt || item.updatedAt || '-'}
                      </td> */}

                      {/* 7. Actions: Eye Icon Button matching Event page */}
                      <td className="py-4 pr-6 pl-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleViewComplaint(item)}
                          disabled={isLoadingDetail}
                          title="View Details"
                          aria-label="View Details"
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#2832A4] bg-white text-[#2832A4] transition-all hover:bg-blue-50 hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-[#2832A4]/20 disabled:opacity-50"
                        >
                          <Eye className="h-4 w-4 stroke-[2]" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* FOOTER: Showing entries count & Button Paginations matching Image 1 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-slate-100 text-sm text-slate-500">
          <p>
            Showing {totalItems === 0 ? 0 : startIndex + 1} to{' '}
            {Math.min(startIndex + paginatedList.length, totalItems)} of {totalItems} entries
          </p>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Pagination Button Group */}
            <nav aria-label="Complaints pagination" className="flex items-center gap-1.5">
              {/* Prev Button */}
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1 || isFetching}
                aria-label="Previous page"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 transition shadow-xs"
              >
                <ChevronLeft className="h-4 w-4 text-slate-600" />
              </button>

              {/* Numbered Page Buttons */}
              {pageNumbers.map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPage(num)}
                  disabled={isFetching}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition shadow-xs',
                    currentPage === num
                      ? 'bg-[#2832A4] text-white shadow-md shadow-[#2832A4]/25'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  )}
                >
                  {num}
                </button>
              ))}

              {/* Next Button */}
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages || isFetching}
                aria-label="Next page"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 transition shadow-xs"
              >
                <ChevronRight className="h-4 w-4 text-slate-600" />
              </button>
            </nav>

            {/* Page Size Selector */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 text-xs">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs focus:border-[#2832A4] focus:outline-none"
              >
                {PAGE_SIZES.map((sz) => (
                  <option key={sz} value={sz}>
                    {sz}/ page
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

