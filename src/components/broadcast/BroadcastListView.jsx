'use client';

import { useState } from 'react';
import {
  Radio,
  Plus,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  Paperclip,
  CheckCircle2,
} from 'lucide-react';
import Loader from '@/components/common/Loader';
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
  const [filterSentTo, setFilterSentTo] = useState('ALL'); // 'ALL' | 'All Members' | 'Committee Members'
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const totalItems = pagination.total_items ?? pagination.total ?? broadcasts.length;
  const totalPages = Math.max(1, pagination.total_page ?? pagination.totalPages ?? Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + broadcasts.length, totalItems);

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

  const displayedBroadcasts = broadcasts.filter((b) => {
    if (filterSentTo === 'ALL') return true;
    return (b.sentTo || b.sendTo || '').toLowerCase() === filterSentTo.toLowerCase();
  });

  return (
    <section className="rounded-3xl border border-white bg-white p-5 sm:p-7 md:p-8 shadow-card space-y-6">
      {/* Top Header: Title "Broadcast" + Action Buttons matching JAA design */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
            Broadcast
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View sent broadcasts or create a new announcement
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* + Create Broadcast Button */}
          <Button
            type="button"
            variant="primary"
            onClick={onCreateBroadcast}
            className="px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-semibold shadow-md shadow-[#2832A4]/20 active:scale-95 gap-1.5"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Create Broadcast</span>
          </Button>

          {/* + Add Group Button */}
          {/* <Button
            type="button"
            variant="primary"
            onClick={onAddGroup}
            className="from-[#1E2B8F] to-[#2832A4] px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-semibold shadow-md shadow-[#1E2B8F]/20 active:scale-95 gap-1.5"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Add Group</span>
          </Button> */}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        {/* Search Input */}
        <div className="relative flex-1 max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search broadcast by title or message..."
            className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-xs sm:text-sm text-ink placeholder:text-slate-400 focus:border-[#2832A4] focus:outline-none focus:ring-4 focus:ring-[#2832A4]/10 transition shadow-2xs"
          />
        </div>

        {/* Filters Dropdown Button */}
        <div className="relative self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setShowFilterDropdown((prev) => !prev)}
            className={cn(
              'rounded-full border px-4 py-2.5 text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition shadow-2xs cursor-pointer',
              filterSentTo !== 'ALL'
                ? 'border-[#2832A4] bg-indigo-50/70 text-[#2832A4]'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
            {filterSentTo !== 'ALL' && (
              <span className="h-2 w-2 rounded-full bg-[#2832A4]" />
            )}
          </button>

          {showFilterDropdown && (
            <div className="absolute right-0 top-full mt-2 z-20 w-52 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl animate-in fade-in-50 zoom-in-95">
              <button
                type="button"
                onClick={() => {
                  setFilterSentTo('ALL');
                  setShowFilterDropdown(false);
                }}
                className={cn(
                  'w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold transition',
                  filterSentTo === 'ALL'
                    ? 'bg-indigo-50 text-[#2832A4]'
                    : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                All Recipients
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterSentTo('All Members');
                  setShowFilterDropdown(false);
                }}
                className={cn(
                  'w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold transition mt-0.5',
                  filterSentTo === 'All Members'
                    ? 'bg-indigo-50 text-[#2832A4]'
                    : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                All Members
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterSentTo('Committee Members');
                  setShowFilterDropdown(false);
                }}
                className={cn(
                  'w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold transition mt-0.5',
                  filterSentTo === 'Committee Members'
                    ? 'bg-indigo-50 text-[#2832A4]'
                    : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                Committee Members
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Broadcasts Table matching Image 3 styling */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-2xs">
        {isLoading || isFetching ? (
          <div className="flex justify-center py-16">
            <Loader label="Loading broadcasts..." />
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
              {displayedBroadcasts.map((b) => (
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
                    {b.sentOn}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-[#2832A4] border border-indigo-100/70">
                      {b.sentTo || b.sendTo || 'All Members'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border border-[#A6F4C5] bg-[#D1FADF]/70 text-[#027A48]">
                      Delivered
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      {/* View Details Button matching other modules */}
                      <button
                        type="button"
                        onClick={() => onViewBroadcast(b)}
                        title="View Details"
                        aria-label="View Details"
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2832A4] bg-white text-[#2832A4] transition-all hover:bg-blue-50 hover:shadow-xs active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#2832A4]/20 cursor-pointer"
                      >
                        <Eye className="h-4 w-4 stroke-[2]" />
                      </button>

                      {/* Delete Broadcast Button matching other modules */}
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

      {/* Footer Matching Groups List */}
      <div className="flex flex-col gap-3.5 border-t border-slate-100 pt-5 text-xs sm:text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <p className="text-center sm:text-left">
          Showing <span className="font-semibold text-slate-700">{totalItems === 0 ? 0 : startIndex + 1}</span> to{' '}
          <span className="font-semibold text-slate-700">{endIndex}</span> of{' '}
          <span className="font-semibold text-slate-700">{totalItems}</span> entries
        </p>

        <div className="flex flex-wrap items-center justify-center sm:justify-between md:justify-end gap-3 w-full md:w-auto">
          {/* Pagination Navigation */}
          <nav aria-label="Broadcast Pagination" className="flex items-center gap-1.5 sm:gap-2">
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

