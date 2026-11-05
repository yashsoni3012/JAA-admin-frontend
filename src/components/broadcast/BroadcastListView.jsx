'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Radio,
  Plus,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  X,
  Eye,
  Trash2,
  Paperclip,
  CheckCircle2,
} from 'lucide-react';
import { TableSkeleton } from '@/components/common/Skeleton';
import EmptyState from '@/components/common/EmptyState';
import Button from '@/components/common/Button';
import { cn } from '@/lib/utils';

const PAGE_SIZES = [5, 10, 20, 50];

export default function BroadcastListView({
  broadcasts = [],
  pagination = {},
  isLoading = false,
  isFetching = false,
  search = '',
  onSearchChange,
  page = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  onCreateBroadcast,
  onAddGroup,
  onViewBroadcast,
  onDeleteBroadcast,
}) {
  // Popover Toggle & Ref
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef(null);

  // Draft filters
  const [filterSearch, setFilterSearch] = useState('');
  const [filterSentTo, setFilterSentTo] = useState('');
  const [filterSentOn, setFilterSentOn] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSortBy, setFilterSortBy] = useState('');

  // Applied filters
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    sentTo: '',
    sentOn: '',
    status: '',
    sortBy: '',
  });

  // Sync draft states on opening popover
  const handleToggleFilterDropdown = () => {
    if (!showFilterDropdown) {
      setFilterSearch(appliedFilters.search);
      setFilterSentTo(appliedFilters.sentTo);
      setFilterSentOn(appliedFilters.sentOn);
      setFilterStatus(appliedFilters.status);
      setFilterSortBy(appliedFilters.sortBy);
      setShowFilterDropdown(true);
    } else {
      setShowFilterDropdown(false);
    }
  };

  // Close on outside click or Escape
  useEffect(() => {
    if (!showFilterDropdown) return;
    const handleOutsideClick = (e) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) {
        setShowFilterDropdown(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setShowFilterDropdown(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showFilterDropdown]);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (appliedFilters.search) count++;
    if (appliedFilters.sentTo) count++;
    if (appliedFilters.sentOn) count++;
    if (appliedFilters.status) count++;
    if (appliedFilters.sortBy) count++;
    return count;
  }, [appliedFilters]);

  const handleApplyFilters = () => {
    setAppliedFilters({
      search: filterSearch.trim(),
      sentTo: filterSentTo,
      sentOn: filterSentOn,
      status: filterStatus,
      sortBy: filterSortBy,
    });
    if (onPageChange) onPageChange(1);
    setShowFilterDropdown(false);
  };

  const handleResetFilters = () => {
    setFilterSearch('');
    setFilterSentTo('');
    setFilterSentOn('');
    setFilterStatus('');
    setFilterSortBy('');
    setAppliedFilters({
      search: '',
      sentTo: '',
      sentOn: '',
      status: '',
      sortBy: '',
    });
    if (onPageChange) onPageChange(1);
  };

  // Filter & Sort broadcasts
  const displayedBroadcasts = useMemo(() => {
    let result = [...broadcasts];

    // 1. Search (popover or top search bar)
    const q = (appliedFilters.search || search || '').toLowerCase().trim();
    if (q) {
      result = result.filter((b) => {
        const title = (b.title || '').toLowerCase();
        const msg = (b.message || '').toLowerCase();
        const sentTo = (b.sentTo || b.sendTo || '').toLowerCase();
        return title.includes(q) || msg.includes(q) || sentTo.includes(q);
      });
    }

    // 2. Sent To
    if (appliedFilters.sentTo) {
      const val = appliedFilters.sentTo.toLowerCase();
      result = result.filter((b) => {
        const sentTo = (b.sentTo || b.sendTo || '').toLowerCase();
        return sentTo.includes(val);
      });
    }

    // 3. Sent On Date
    if (appliedFilters.sentOn) {
      const targetDate = appliedFilters.sentOn; // YYYY-MM-DD
      result = result.filter((b) => {
        const checkDate = (val) => {
          if (!val) return false;
          const d = new Date(val);
          if (isNaN(d.getTime())) {
            return String(val).toLowerCase().includes(targetDate.toLowerCase());
          }
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const localIso = `${y}-${m}-${day}`;
          if (localIso === targetDate) return true;
          try {
            if (d.toISOString().split('T')[0] === targetDate) return true;
          } catch {}
          return false;
        };
        return checkDate(b.sentOn) || checkDate(b.createdAt) || checkDate(b.date);
      });
    }

    // 4. Status
    if (appliedFilters.status) {
      const val = appliedFilters.status.toLowerCase();
      result = result.filter((b) => (b.status || '').toLowerCase() === val);
    }

    // 5. Sort By
    if (appliedFilters.sortBy) {
      result.sort((a, b) => {
        const titleA = (a.title || '').toLowerCase();
        const titleB = (b.title || '').toLowerCase();
        const dateA = new Date(a.sentOn || a.createdAt || a.date || 0).getTime();
        const dateB = new Date(b.sentOn || b.createdAt || b.date || 0).getTime();

        switch (appliedFilters.sortBy) {
          case 'newest':
            return dateB - dateA;
          case 'oldest':
            return dateA - dateB;
          case 'title_asc':
            return titleA.localeCompare(titleB);
          case 'title_desc':
            return titleB.localeCompare(titleA);
          default:
            return 0;
        }
      });
    }

    return result;
  }, [broadcasts, search, appliedFilters]);

  // Pagination calculation
  const isCustomFiltered = activeFilterCount > 0;
  const totalItems = isCustomFiltered
    ? displayedBroadcasts.length
    : pagination.total_items ?? pagination.total ?? broadcasts.length;
  const totalPages = Math.max(1, pagination.total_page ?? pagination.totalPages ?? Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize;

  const paginatedBroadcasts = useMemo(() => {
    if (isCustomFiltered) {
      return displayedBroadcasts.slice(startIndex, startIndex + pageSize);
    }
    return displayedBroadcasts;
  }, [displayedBroadcasts, isCustomFiltered, startIndex, pageSize]);

  const endIndex = Math.min(startIndex + (isCustomFiltered ? paginatedBroadcasts.length : displayedBroadcasts.length), totalItems);

  // Dynamic pagination window
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

  return (
    <section className="rounded-3xl border border-white bg-white p-5 sm:p-7 md:p-8 shadow-card space-y-6">
      {/* Search, Filters & Action Button in ONE Equal Line */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        {/* Search Input */}
        <div className="relative flex-1 max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search broadcast by title or message..."
            className="h-10 w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 text-xs sm:text-sm text-ink placeholder:text-slate-400 focus:border-[#2832A4] focus:outline-none focus:ring-4 focus:ring-[#2832A4]/10 transition shadow-2xs"
          />
        </div>

        {/* Right Controls: Filters Button + Create Broadcast Button with Equal Height */}
        <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
          {/* Filters Dropdown Button matching Groups View */}
          <div ref={filterDropdownRef} className="relative">
            <button
              type="button"
              onClick={handleToggleFilterDropdown}
              className={cn(
                'h-10 rounded-full border px-4 text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition shadow-2xs cursor-pointer',
                activeFilterCount > 0
                  ? 'border-[#2832A4] bg-indigo-50/70 text-[#2832A4]'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2832A4] text-white text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

          {/* Floating Filter Popover Card */}
          {showFilterDropdown && (
            <div className="absolute right-0 top-full mt-2.5 z-40 w-[340px] sm:w-[380px] max-w-[calc(100vw-2rem)] rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl animate-in fade-in-50 zoom-in-95 duration-150 space-y-4">
              {/* Top-Right Red Close Button */}
              <button
                type="button"
                onClick={() => setShowFilterDropdown(false)}
                title="Close filters"
                aria-label="Close filters"
                className="absolute top-5 right-5 h-7 w-7 rounded-full bg-[#FFEAEB] text-[#FF4D4F] hover:bg-[#FFD9DC] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4 stroke-[2.5]" />
              </button>

              {/* 1. Search Broadcasts */}
              <div>
                <label className="text-xs sm:text-sm font-bold text-ink mb-1.5 block">
                  Search Broadcasts
                </label>
                <input
                  type="text"
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  placeholder="Search broadcast..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm text-ink placeholder:text-slate-400 focus:border-[#2832A4] focus:outline-none focus:ring-2 focus:ring-[#2832A4]/10 transition shadow-2xs"
                />
              </div>

              {/* 2. Sent To */}
              <div>
                <label className="text-xs sm:text-sm font-bold text-ink mb-1.5 block">
                  Sent To
                </label>
                <div className="relative">
                  <select
                    value={filterSentTo}
                    onChange={(e) => setFilterSentTo(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-xs sm:text-sm text-ink focus:border-[#2832A4] focus:outline-none focus:ring-2 focus:ring-[#2832A4]/10 transition shadow-2xs cursor-pointer"
                  >
                    <option value="">Select recipient</option>
                    <option value="All Members">All Members</option>
                    <option value="Committee Members">Committee Members</option>
                    <option value="Custom Group">Custom Group</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>

              {/* 3. Sent On Date Picker */}
              <div>
                <label className="text-xs sm:text-sm font-bold text-ink mb-1.5 block">
                  Sent On
                </label>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={filterSentOn ? 'date' : 'text'}
                    onFocus={(e) => (e.target.type = 'date')}
                    onBlur={(e) => {
                      if (!e.target.value) e.target.type = 'text';
                    }}
                    value={filterSentOn}
                    onChange={(e) => setFilterSentOn(e.target.value)}
                    placeholder="Select date"
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm text-ink placeholder:text-slate-400 focus:border-[#2832A4] focus:outline-none focus:ring-2 focus:ring-[#2832A4]/10 transition shadow-2xs"
                  />
                </div>
              </div>

              {/* 4. Status */}
              <div>
                <label className="text-xs sm:text-sm font-bold text-ink mb-1.5 block">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-xs sm:text-sm text-ink focus:border-[#2832A4] focus:outline-none focus:ring-2 focus:ring-[#2832A4]/10 transition shadow-2xs cursor-pointer"
                  >
                    <option value="">Select status</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Failed">Failed</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>

              {/* 5. Sort By */}
              <div>
                <label className="text-xs sm:text-sm font-bold text-ink mb-1.5 block">
                  Sort By
                </label>
                <div className="relative">
                  <select
                    value={filterSortBy}
                    onChange={(e) => setFilterSortBy(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-xs sm:text-sm text-ink focus:border-[#2832A4] focus:outline-none focus:ring-2 focus:ring-[#2832A4]/10 transition shadow-2xs cursor-pointer"
                  >
                    <option value="">Select</option>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="title_asc">Title (A - Z)</option>
                    <option value="title_desc">Title (Z - A)</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>

              {/* 6. Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex-1 rounded-full border border-slate-200 bg-white py-2.5 px-5 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50 transition active:scale-95 cursor-pointer shadow-2xs text-center"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleApplyFilters}
                  className="flex-1 rounded-full border border-[#2832A4] bg-white py-2.5 px-5 text-xs sm:text-sm font-semibold text-[#2832A4] hover:bg-blue-50 transition active:scale-95 cursor-pointer shadow-2xs text-center"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* + Create Broadcast Button with equal h-10 height */}
        <Button
          type="button"
          variant="primary"
          onClick={onCreateBroadcast}
          className="h-10 px-5 sm:px-6 text-xs sm:text-sm font-semibold shadow-md shadow-[#2832A4]/20 active:scale-95 gap-1.5 rounded-full inline-flex items-center"
        >
          <Plus className="h-4 w-4 stroke-[2.5]" />
          <span>Create Broadcast</span>
        </Button>
      </div>
    </div>

      {/* Active Filter Badges */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <span className="text-xs font-semibold text-slate-400">Active Filters:</span>
          {appliedFilters.search && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#2832A4] border border-blue-100">
              <span>Search: "{appliedFilters.search}"</span>
              <button
                type="button"
                onClick={() => setAppliedFilters((prev) => ({ ...prev, search: '' }))}
                className="hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {appliedFilters.sentTo && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#2832A4] border border-blue-100">
              <span>Sent To: {appliedFilters.sentTo}</span>
              <button
                type="button"
                onClick={() => setAppliedFilters((prev) => ({ ...prev, sentTo: '' }))}
                className="hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {appliedFilters.sentOn && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#2832A4] border border-blue-100">
              <span>Date: {appliedFilters.sentOn}</span>
              <button
                type="button"
                onClick={() => setAppliedFilters((prev) => ({ ...prev, sentOn: '' }))}
                className="hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {appliedFilters.status && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#2832A4] border border-blue-100">
              <span>Status: {appliedFilters.status}</span>
              <button
                type="button"
                onClick={() => setAppliedFilters((prev) => ({ ...prev, status: '' }))}
                className="hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {appliedFilters.sortBy && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#2832A4] border border-blue-100">
              <span>Sort: {appliedFilters.sortBy}</span>
              <button
                type="button"
                onClick={() => setAppliedFilters((prev) => ({ ...prev, sortBy: '' }))}
                className="hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-xs text-red-500 hover:underline font-semibold ml-1 cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Broadcasts Table matching Image 3 styling */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-2xs">
        {isLoading && displayedBroadcasts.length === 0 ? (
          <div className="p-4 sm:p-6">
            <TableSkeleton rows={6} cols={6} />
          </div>
        ) : displayedBroadcasts.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title="No broadcasts found"
              description={
                search
                  ? `No broadcast matching "${search}".`
                  : 'No broadcast created yet. Click "+ Create Broadcast" to send your first message.'
              }
            />
          </div>
        ) : (
          <table className="w-full min-w-[750px] text-left text-xs sm:text-sm">
            <thead className="bg-[#F8FAFC] text-[11px] sm:text-xs uppercase tracking-wider font-bold text-slate-500 border-b border-slate-100">
              <tr>
                <th scope="col" className="px-5 py-3.5 font-bold">Title</th>
                <th scope="col" className="px-5 py-3.5 font-bold">Message</th>
                <th scope="col" className="px-5 py-3.5 font-bold">Sent On</th>
                <th scope="col" className="px-5 py-3.5 font-bold">Sent To</th>
                <th scope="col" className="px-5 py-3.5 font-bold text-center">Status</th>
                <th scope="col" className="px-5 py-3.5 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedBroadcasts.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/60 transition group">
                  <td className="px-5 py-4 font-bold text-ink whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-[200px]">{b.title || b.broadcastTitle}</span>
                      {b.attachment && (
                        <span title="Has attachment" className="text-slate-400">
                          <Paperclip className="h-3.5 w-3.5 rotate-45" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-500 max-w-xs truncate">
                    {b.message}
                  </td>
                  <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                    {b.sentOn || b.createdAt || '-'}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-[#2832A4] border border-indigo-100/70">
                      {b.sentTo || b.sendTo || 'All Members'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border border-[#A6F4C5] bg-[#D1FADF]/70 text-[#027A48]">
                      {b.status || 'Delivered'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      {/* View Details Icon Button matching other modules */}
                      <button
                        type="button"
                        onClick={() => onViewBroadcast(b)}
                        title="View Details"
                        aria-label="View Details"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2832A4] bg-white text-[#2832A4] transition-all hover:bg-blue-50 hover:shadow-xs active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#2832A4]/20 cursor-pointer"
                      >
                        <Eye className="h-4 w-4 stroke-[2]" />
                      </button>

                      {/* Delete Broadcast Icon Button matching other modules */}
                      <button
                        type="button"
                        onClick={() => onDeleteBroadcast(b)}
                        title="Delete Broadcast"
                        aria-label="Delete Broadcast"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-white text-red-500 transition-all hover:border-red-400 hover:bg-red-50 hover:shadow-xs active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-100 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4 stroke-[2]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer matching JAA design */}
      <div className="flex flex-col gap-3.5 border-t border-slate-100 pt-5 text-xs sm:text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
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
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
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
                onClick={() => onPageChange(num)}
                disabled={isFetching}
                aria-current={num === currentPage ? 'page' : undefined}
                className={cn(
                  'flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border text-xs sm:text-sm font-semibold transition shadow-2xs',
                  num === currentPage
                    ? 'border-transparent bg-[#2832A4] text-white shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                )}
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage >= totalPages || isFetching}
              aria-label="Next page"
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 transition shadow-2xs"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </nav>

          {/* Rows per page selector */}
          <div className="flex items-center gap-1.5">
            <label className="sr-only" htmlFor="broadcast-page-size">
              Rows per page
            </label>
            <select
              id="broadcast-page-size"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-full border border-slate-200 bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-600 focus:border-[#2832A4] focus:outline-none shadow-2xs cursor-pointer"
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
    </section>
  );
}

