'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar,
  X,
  Eye,
  Edit3,
  SquarePen,
  Trash2,
} from 'lucide-react';
import Button from '@/components/common/Button';
import { GroupListSkeleton } from '@/components/common/Skeleton';
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
  // Popover Toggle & Outside Click Listener
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef(null);

  // Draft filters (inputs inside popover matching Image)
  const [filterSearch, setFilterSearch] = useState('');
  const [filterCreatedBy, setFilterCreatedBy] = useState('');
  const [filterMinMembers, setFilterMinMembers] = useState('');
  const [filterMaxMembers, setFilterMaxMembers] = useState('');
  const [filterCreatedOn, setFilterCreatedOn] = useState('');
  const [filterSortBy, setFilterSortBy] = useState('');

  // Applied filters (active on the list)
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    createdBy: '',
    minMembers: '',
    maxMembers: '',
    createdOn: '',
    sortBy: '',
  });

  // Sync draft states when opening popover
  const handleToggleFilterDropdown = () => {
    if (!showFilterDropdown) {
      setFilterSearch(appliedFilters.search);
      setFilterCreatedBy(appliedFilters.createdBy);
      setFilterMinMembers(appliedFilters.minMembers);
      setFilterMaxMembers(appliedFilters.maxMembers);
      setFilterCreatedOn(appliedFilters.createdOn);
      setFilterSortBy(appliedFilters.sortBy);
      setShowFilterDropdown(true);
    } else {
      setShowFilterDropdown(false);
    }
  };

  // Close popover on click outside or Escape
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
    if (appliedFilters.createdBy) count++;
    if (appliedFilters.minMembers || appliedFilters.maxMembers) count++;
    if (appliedFilters.createdOn) count++;
    if (appliedFilters.sortBy) count++;
    return count;
  }, [appliedFilters]);

  const handleApplyFilters = () => {
    setAppliedFilters({
      search: filterSearch.trim(),
      createdBy: filterCreatedBy,
      minMembers: filterMinMembers,
      maxMembers: filterMaxMembers,
      createdOn: filterCreatedOn,
      sortBy: filterSortBy,
    });
    if (onPageChange) onPageChange(1);
    setShowFilterDropdown(false);
  };

  const handleResetFilters = () => {
    setFilterSearch('');
    setFilterCreatedBy('');
    setFilterMinMembers('');
    setFilterMaxMembers('');
    setFilterCreatedOn('');
    setFilterSortBy('');
    setAppliedFilters({
      search: '',
      createdBy: '',
      minMembers: '',
      maxMembers: '',
      createdOn: '',
      sortBy: '',
    });
    if (onPageChange) onPageChange(1);
  };

  // Filter & Sort Groups
  const displayedGroups = useMemo(() => {
    let result = [...groups];

    // 1. Search filter (from popover or top search bar)
    const q = (appliedFilters.search || search || '').toLowerCase().trim();
    if (q) {
      result = result.filter((g) => {
        const name = (g.name || '').toLowerCase();
        const about = (g.about || g.description || '').toLowerCase();
        const createdBy = (g.createdBy || '').toLowerCase();
        return name.includes(q) || about.includes(q) || createdBy.includes(q);
      });
    }

    // 2. Created By / Status filter
    if (appliedFilters.createdBy) {
      const val = appliedFilters.createdBy.toLowerCase();
      if (val === 'active') {
        result = result.filter((g) => g.status !== false);
      } else if (val === 'inactive') {
        result = result.filter((g) => g.status === false);
      } else {
        result = result.filter((g) => (g.createdBy || '').toLowerCase() === val);
      }
    }

    // 3. Member Count range
    if (appliedFilters.minMembers !== '' && !isNaN(Number(appliedFilters.minMembers))) {
      const min = Number(appliedFilters.minMembers);
      result = result.filter((g) => {
        const count = g.memberCount ?? g.members?.length ?? 0;
        return count >= min;
      });
    }
    if (appliedFilters.maxMembers !== '' && !isNaN(Number(appliedFilters.maxMembers))) {
      const max = Number(appliedFilters.maxMembers);
      result = result.filter((g) => {
        const count = g.memberCount ?? g.members?.length ?? 0;
        return count <= max;
      });
    }

    // 4. Created On Date
    if (appliedFilters.createdOn) {
      const targetDate = appliedFilters.createdOn; // YYYY-MM-DD
      result = result.filter((g) => {
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
        return checkDate(g.createdAt) || checkDate(g.createdOn);
      });
    }

    // 5. Sort By
    if (appliedFilters.sortBy) {
      result.sort((a, b) => {
        const countA = a.memberCount ?? a.members?.length ?? 0;
        const countB = b.memberCount ?? b.members?.length ?? 0;
        const nameA = (a.name || '').toLowerCase();
        const nameB = (b.name || '').toLowerCase();
        const dateA = new Date(a.createdAt || a.createdOn || 0).getTime();
        const dateB = new Date(b.createdAt || b.createdOn || 0).getTime();

        switch (appliedFilters.sortBy) {
          case 'newest':
            return dateB - dateA;
          case 'oldest':
            return dateA - dateB;
          case 'members_desc':
            return countB - countA;
          case 'members_asc':
            return countA - countB;
          case 'name_asc':
            return nameA.localeCompare(nameB);
          case 'name_desc':
            return nameB.localeCompare(nameA);
          default:
            return 0;
        }
      });
    }

    return result;
  }, [groups, search, appliedFilters]);

  // Pagination calculation
  const isCustomFiltered = activeFilterCount > 0;
  const totalItems = isCustomFiltered
    ? displayedGroups.length
    : pagination.total_items ?? pagination.total ?? groups.length;
  const totalPages = Math.max(1, pagination.total_page ?? pagination.totalPages ?? Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize;

  const paginatedGroups = useMemo(() => {
    if (isCustomFiltered) {
      return displayedGroups.slice(startIndex, startIndex + pageSize);
    }
    return displayedGroups;
  }, [displayedGroups, isCustomFiltered, startIndex, pageSize]);

  const endIndex = Math.min(startIndex + (isCustomFiltered ? paginatedGroups.length : displayedGroups.length), totalItems);

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
          {/* + Add Group Button matching Image */}
          <Button
            type="button"
            variant="primary"
            onClick={onAddGroup}
            className="px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-semibold shadow-md shadow-[#2832A4]/20 active:scale-95 gap-1.5"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Add Group</span>
          </Button>

          {/* + Add Message Button matching Image */}
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

      {/* Search & Filter Bar matching Image */}
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

        {/* Filters Button with Popover Panel matching Image */}
        <div ref={filterDropdownRef} className="relative self-end sm:self-auto">
          <button
            type="button"
            onClick={handleToggleFilterDropdown}
            className={cn(
              'rounded-full border px-4 py-2.5 text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition shadow-2xs cursor-pointer',
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

          {/* Floating Filter Popover Card matching Image */}
          {showFilterDropdown && (
            <div className="absolute right-0 top-full mt-2.5 z-40 w-[340px] sm:w-[380px] max-w-[calc(100vw-2rem)] rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl animate-in fade-in-50 zoom-in-95 duration-150 space-y-4">
              {/* Top-Right Red Close Button matching Image */}
              <button
                type="button"
                onClick={() => setShowFilterDropdown(false)}
                title="Close filters"
                aria-label="Close filters"
                className="absolute top-5 right-5 h-7 w-7 rounded-full bg-[#FFEAEB] text-[#FF4D4F] hover:bg-[#FFD9DC] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="h-4 w-4 stroke-[2.5]" />
              </button>

              {/* 1. Search Groups */}
              <div>
                <label className="text-xs sm:text-sm font-bold text-ink mb-1.5 block">
                  Search Groups
                </label>
                <input
                  type="text"
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                  placeholder="Search group..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm text-ink placeholder:text-slate-400 focus:border-[#2832A4] focus:outline-none focus:ring-2 focus:ring-[#2832A4]/10 transition shadow-2xs"
                />
              </div>

              {/* 2. Created By / Status */}
              <div>
                <label className="text-xs sm:text-sm font-bold text-ink mb-1.5 block">
                  Created By
                </label>
                <div className="relative">
                  <select
                    value={filterCreatedBy}
                    onChange={(e) => setFilterCreatedBy(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-xs sm:text-sm text-ink focus:border-[#2832A4] focus:outline-none focus:ring-2 focus:ring-[#2832A4]/10 transition shadow-2xs cursor-pointer"
                  >
                    <option value="">Select status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Admin User">Admin User</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>

              {/* 3. Member Count (Min to Max) */}
              <div>
                <label className="text-xs sm:text-sm font-bold text-ink mb-1.5 block">
                  Member Count
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    type="number"
                    min="0"
                    value={filterMinMembers}
                    onChange={(e) => setFilterMinMembers(e.target.value)}
                    placeholder="Min"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-ink placeholder:text-slate-400 focus:border-[#2832A4] focus:outline-none focus:ring-2 focus:ring-[#2832A4]/10 transition shadow-2xs text-center"
                  />
                  <span className="text-xs text-slate-400 font-medium shrink-0">to</span>
                  <input
                    type="number"
                    min="0"
                    value={filterMaxMembers}
                    onChange={(e) => setFilterMaxMembers(e.target.value)}
                    placeholder="Max"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-ink placeholder:text-slate-400 focus:border-[#2832A4] focus:outline-none focus:ring-2 focus:ring-[#2832A4]/10 transition shadow-2xs text-center"
                  />
                </div>
              </div>

              {/* 4. Created On Date Picker */}
              <div>
                <label className="text-xs sm:text-sm font-bold text-ink mb-1.5 block">
                  Created On
                </label>
                <div className="relative">
                  <Calendar className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={filterCreatedOn ? 'date' : 'text'}
                    onFocus={(e) => (e.target.type = 'date')}
                    onBlur={(e) => {
                      if (!e.target.value) e.target.type = 'text';
                    }}
                    value={filterCreatedOn}
                    onChange={(e) => setFilterCreatedOn(e.target.value)}
                    placeholder="Select date"
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm text-ink placeholder:text-slate-400 focus:border-[#2832A4] focus:outline-none focus:ring-2 focus:ring-[#2832A4]/10 transition shadow-2xs"
                  />
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
                    <option value="members_desc">Most Members</option>
                    <option value="members_asc">Least Members</option>
                    <option value="name_asc">Name (A - Z)</option>
                    <option value="name_desc">Name (Z - A)</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>

              {/* 6. Action Buttons matching Image */}
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
          {appliedFilters.createdBy && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#2832A4] border border-blue-100">
              <span>Status: {appliedFilters.createdBy}</span>
              <button
                type="button"
                onClick={() => setAppliedFilters((prev) => ({ ...prev, createdBy: '' }))}
                className="hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {(appliedFilters.minMembers || appliedFilters.maxMembers) && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#2832A4] border border-blue-100">
              <span>
                Members: {appliedFilters.minMembers || '0'} - {appliedFilters.maxMembers || 'Any'}
              </span>
              <button
                type="button"
                onClick={() =>
                  setAppliedFilters((prev) => ({ ...prev, minMembers: '', maxMembers: '' }))
                }
                className="hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {appliedFilters.createdOn && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#2832A4] border border-blue-100">
              <span>Date: {appliedFilters.createdOn}</span>
              <button
                type="button"
                onClick={() => setAppliedFilters((prev) => ({ ...prev, createdOn: '' }))}
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

      {/* Groups List Stack matching Image 1 */}
      <div className="space-y-3.5">
        {isLoading && displayedGroups.length === 0 ? (
          <GroupListSkeleton rows={5} />
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
          paginatedGroups.map((group) => {
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
                  {/* View Group Details Icon Button */}
                  <button
                    type="button"
                    onClick={() => onViewGroup(group)}
                    title="View Details"
                    aria-label="View Details"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2832A4] bg-white text-[#2832A4] transition-all hover:bg-blue-50 hover:shadow-xs active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#2832A4]/20 cursor-pointer"
                  >
                    <Eye className="h-4 w-4 stroke-[2]" />
                  </button>

                  {/* Edit Group Icon Button */}
                  <button
                    type="button"
                    onClick={() => onEditGroup(group)}
                    title="Edit Group"
                    aria-label="Edit Group"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all hover:border-[#2832A4] hover:text-[#2832A4] hover:bg-slate-50 hover:shadow-xs active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#2832A4]/20 cursor-pointer"
                  >
                    <Edit3 className="h-4 w-4 stroke-[2]" />
                  </button>

                  {/* Delete Group Icon Button */}
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

