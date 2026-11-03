'use client';

import { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  Trash2,
} from 'lucide-react';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';
import { cn } from '@/lib/utils';

const PAGE_SIZES = [5, 10, 20, 50];

export default function GroupsListView({
  groups = [],
  pagination = {},
  isLoading = false,
  isFetching = false,
  search = '',
  onSearchChange,
  page = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  onAddGroup,
  onAddMessage,
  onViewGroup,
  onEditGroup,
  onDeleteGroup,
}) {
  const [filterActiveOnly, setFilterActiveOnly] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const totalItems = pagination.total_items ?? pagination.total ?? groups.length;
  const totalPages = Math.max(1, pagination.total_page ?? pagination.totalPages ?? Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + groups.length, totalItems);

  // Dynamic 3-5 page numbers window
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

  const displayedGroups = filterActiveOnly
    ? groups.filter((g) => g.status !== false)
    : groups;

  return (
    <section className="rounded-3xl border border-white bg-white p-5 sm:p-7 md:p-8 shadow-card space-y-6">
      {/* Top Header: Title "Groups" + Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
            Groups
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* + Add Group Button matching Image 1 */}
          <Button
            type="button"
            variant="primary"
            onClick={onAddGroup}
            className="px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-semibold shadow-md shadow-[#2832A4]/20 active:scale-95 gap-1.5"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Add Group</span>
          </Button>

          {/* + Add Message Button matching Image 1 */}
          {/* <Button
            type="button"
            variant="primary"
            onClick={onAddMessage}
            className="from-[#1E2B8F] to-[#2832A4] px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-semibold shadow-md shadow-[#1E2B8F]/20 active:scale-95 gap-1.5"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Add Message</span>
          </Button> */}
        </div>
      </div>

      {/* Search & Filter Bar matching Image 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        {/* Search Input */}
        <div className="relative flex-1 max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by groups by name..."
            className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-xs sm:text-sm text-ink placeholder:text-slate-400 focus:border-[#2832A4] focus:outline-none focus:ring-4 focus:ring-[#2832A4]/10 transition shadow-2xs"
          />
        </div>

        {/* Filters Button with Dropdown */}
        <div className="relative self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setShowFilterDropdown((prev) => !prev)}
            className={cn(
              'rounded-full border px-4 py-2.5 text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition shadow-2xs cursor-pointer',
              filterActiveOnly
                ? 'border-[#2832A4] bg-indigo-50/70 text-[#2832A4]'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Filters</span>
            {filterActiveOnly && (
              <span className="h-2 w-2 rounded-full bg-[#2832A4]" />
            )}
          </button>

          {showFilterDropdown && (
            <div className="absolute right-0 top-full mt-2 z-20 w-48 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl animate-in fade-in-50 zoom-in-95">
              <button
                type="button"
                onClick={() => {
                  setFilterActiveOnly(false);
                  setShowFilterDropdown(false);
                }}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition',
                  !filterActiveOnly ? 'bg-indigo-50 text-[#2832A4]' : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                All Groups
              </button>
              <button
                type="button"
                onClick={() => {
                  setFilterActiveOnly(true);
                  setShowFilterDropdown(false);
                }}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition',
                  filterActiveOnly ? 'bg-indigo-50 text-[#2832A4]' : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                Active Only
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Groups List Stack matching Image 1 */}
      <div className="space-y-3.5">
        {isLoading || isFetching ? (
          <div className="flex justify-center py-16">
            <Loader label="Loading groups..." />
          </div>
        ) : displayedGroups.length === 0 ? (
          <EmptyState
            title="No groups found"
            description={
              search
                ? `No group found matching "${search}".`
                : 'No group created yet. Click "+ Add Group" to create your first group.'
            }
          />
        ) : (
          displayedGroups.map((group) => {
            const memberCount = group.memberCount || group.members?.length || 25;
            return (
              <div
                key={group.id}
                className="rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-4 sm:p-5 hover:border-indigo-100 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                {/* Left: Circle Icon + Group Info */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-[#EEF2FF] flex items-center justify-center shrink-0 text-[#2832A4] shadow-2xs group-hover:scale-105 transition-transform">
                    <Users className="h-6 w-6 stroke-[1.8]" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-ink truncate leading-snug">
                      {group.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                      {memberCount} Members
                    </p>
                  </div>
                </div>

                {/* Right: View, Edit & Delete Action Buttons matching other modules */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {/* View Group Details Eye Button */}
                  <button
                    type="button"
                    onClick={() => onViewGroup(group)}
                    title="View Details"
                    aria-label="View Details"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2832A4] bg-white text-[#2832A4] transition-all hover:bg-blue-50 hover:shadow-xs active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#2832A4]/20 cursor-pointer"
                  >
                    <Eye className="h-4 w-4 stroke-[2]" />
                  </button>

                  {/* Edit Group Button */}
                  <button
                    type="button"
                    onClick={() => onEditGroup(group)}
                    title="Edit Group"
                    aria-label="Edit Group"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all hover:border-[#2832A4] hover:text-[#2832A4] hover:bg-slate-50 hover:shadow-xs active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#2832A4]/20 cursor-pointer"
                  >
                    <Edit3 className="h-4 w-4 stroke-[2]" />
                  </button>

                  {/* Delete Group Button */}
                  <button
                    type="button"
                    onClick={() => onDeleteGroup(group)}
                    title="Delete Group"
                    aria-label="Delete Group"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-white text-red-500 transition-all hover:border-red-400 hover:bg-red-50 hover:shadow-xs active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-100 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4 stroke-[2]" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer matching Image 1 */}
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

          {/* Rows per page dropdown matching Image 1 */}
          <div className="flex items-center gap-1.5">
            <label className="sr-only" htmlFor="group-page-size">
              Rows per page
            </label>
            <select
              id="group-page-size"
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

