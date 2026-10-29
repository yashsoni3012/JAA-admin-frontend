'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Plus,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  X,
} from 'lucide-react';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';
import EventCard from '@/components/events/EventCard';
import AddEditEventModal from '@/components/events/AddEditEventModal';
import DeleteEventModal from '@/components/events/DeleteEventModal';
import ViewEventModal from '@/components/events/ViewEventModal';
import {
  getEvents,
  toggleEventStatus,
} from '@/services/event.service';
import { cn } from '@/lib/utils';

const PAGE_SIZES = [5, 10, 20, 50];

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Modals state
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [toast, setToast] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Load events from backend
  const loadEvents = useCallback(
    async (targetPage = 1, targetSize = 10, targetSearch = '') => {
      setIsFetching(true);
      try {
        const res = await getEvents({
          page: targetPage,
          limit: targetSize,
          search: targetSearch,
        });

        setEvents(res.events || []);
        if (res.pagination) {
          setPagination({
            total: res.pagination.total ?? res.events.length,
            page: res.pagination.page ?? targetPage,
            limit: res.pagination.limit ?? targetSize,
            totalPages:
              res.pagination.totalPages ??
              Math.max(1, Math.ceil((res.pagination.total ?? res.events.length) / targetSize)),
            hasNext: Boolean(res.pagination.hasNext),
            hasPrev: Boolean(res.pagination.hasPrev),
          });
        }
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setIsLoading(false);
        setIsFetching(false);
      }
    },
    []
  );

  useEffect(() => {
    loadEvents(page, pageSize, debouncedSearch);
  }, [loadEvents, page, pageSize, debouncedSearch]);

  // Client-side status filtering if active/inactive filter is chosen
  const filteredEvents = useMemo(() => {
    if (statusFilter === 'ACTIVE') {
      return events.filter((e) => e.isActive);
    }
    if (statusFilter === 'INACTIVE') {
      return events.filter((e) => !e.isActive);
    }
    return events;
  }, [events, statusFilter]);

  // Toggle active/inactive status
  const handleToggleStatus = async (id) => {
    try {
      const updated = await toggleEventStatus(id);
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, isActive: updated.isActive } : e))
      );
      setToast(`Event status updated to ${updated.isActive ? 'Active' : 'Inactive'}.`);
      setTimeout(() => setToast(null), 3500);
    } catch (err) {
      console.error('Failed to toggle event status:', err);
      setToast(err.message || 'Failed to toggle event status.');
      setTimeout(() => setToast(null), 3500);
      throw err;
    }
  };

  // Saved (created or updated)
  const handleEventSaved = (savedEvent, isEditing) => {
    if (isEditing) {
      setEvents((prev) =>
        prev.map((e) => (e.id === savedEvent.id ? { ...e, ...savedEvent } : e))
      );
      if (selectedEvent && selectedEvent.id === savedEvent.id) {
        setSelectedEvent(savedEvent);
      }
      setToast(`Event "${savedEvent.title}" updated successfully.`);
    } else {
      setEvents((prev) => [savedEvent, ...prev]);
      setToast(`Event "${savedEvent.title}" created successfully.`);
    }
    setTimeout(() => setToast(null), 4000);
    loadEvents(page, pageSize, debouncedSearch);
  };

  // Deleted
  const handleEventDeleted = (id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setToast('Event deleted successfully.');
    setTimeout(() => setToast(null), 3500);
    loadEvents(page, pageSize, debouncedSearch);
  };

  // Pagination calculation
  const totalItems = pagination.total;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;

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

  return (
    <div className="space-y-6">
      {/* Main Events Container */}
      <section className="rounded-3xl border border-white bg-white p-6 md:p-8 shadow-card space-y-6">
        {/* TOP CONTROLS BAR: Search, Filters, Add Event matching Image 1 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-lg">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, business, mobile..."
              className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-ink placeholder:text-slate-400 shadow-xs focus:border-[#2832A4] focus:outline-none focus:ring-4 focus:ring-[#2832A4]/10 transition"
            />
          </div>

          {/* Action Buttons: Filters + Add Event */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Filters Menu Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowFilterMenu((prev) => !prev)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition shadow-xs',
                  statusFilter !== 'ALL'
                    ? 'border-[#2832A4] bg-blue-50/60 text-[#2832A4]'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
                {statusFilter !== 'ALL' && (
                  <span className="h-2 w-2 rounded-full bg-[#2832A4]" />
                )}
              </button>

              {/* Filters Dropdown */}
              {showFilterMenu && (
                <div className="absolute right-0 mt-2 z-20 w-44 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                  <p className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Filter by Status
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('ALL');
                      setShowFilterMenu(false);
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition',
                      statusFilter === 'ALL'
                        ? 'bg-blue-50 text-[#2832A4]'
                        : 'text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    All Events
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('ACTIVE');
                      setShowFilterMenu(false);
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition',
                      statusFilter === 'ACTIVE'
                        ? 'bg-blue-50 text-[#2832A4]'
                        : 'text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    Active Only
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('INACTIVE');
                      setShowFilterMenu(false);
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition',
                      statusFilter === 'INACTIVE'
                        ? 'bg-blue-50 text-[#2832A4]'
                        : 'text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    Inactive Only
                  </button>
                </div>
              )}
            </div>

            {/* + Add Event Button */}
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                setEditingEvent(null);
                setIsAddEditOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold shadow-md shadow-[#2832A4]/20"
            >
              <Plus className="h-4 w-4" />
              <span>Add Event</span>
            </Button>
          </div>
        </div>

        {/* EVENTS LIST */}
        {isFetching && events.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader label="Loading events..." />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title="No events found"
              description="Try adjusting your search query or filters, or create a new event."
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Table Column Header */}
            <div className="hidden lg:grid grid-cols-12 gap-6 px-6 py-3 border-b border-slate-100 bg-[#F8FAFC] rounded-2xl text-xs font-bold uppercase tracking-wider text-slate-500">
              <div className="col-span-7 xl:col-span-8">Event Details</div>
              <div className="col-span-2 xl:col-span-2 text-center">Status</div>
              <div className="col-span-3 xl:col-span-2 text-right">Actions</div>
            </div>

            {filteredEvents.map((item) => (
              <EventCard
                key={item.id}
                event={item}
                onView={(ev) => setSelectedEvent(ev)}
                onEdit={(ev) => {
                  setEditingEvent(ev);
                  setIsAddEditOpen(true);
                }}
                onDelete={(ev) => setDeletingEvent(ev)}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        )}

        {/* FOOTER: Showing entries count & Button Paginations matching Image 1 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-slate-100 text-sm text-slate-500">
          <p>
            Showing {totalItems === 0 ? 0 : startIndex + 1} to{' '}
            {Math.min(startIndex + filteredEvents.length, totalItems)} of {totalItems} entries
          </p>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Pagination Button Group */}
            <nav aria-label="Events pagination" className="flex items-center gap-1.5">
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
                  aria-current={num === currentPage ? 'page' : undefined}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition shadow-xs',
                    num === currentPage
                      ? 'border-transparent bg-[#2832A4] text-white shadow-md'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
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
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-sm font-medium text-slate-600 focus:border-[#2832A4] focus:outline-none shadow-xs"
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}/ page
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* View Event Modal */}
      <ViewEventModal
        open={Boolean(selectedEvent)}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onEdit={(ev) => {
          setSelectedEvent(null);
          setEditingEvent(ev);
          setIsAddEditOpen(true);
        }}
      />

      {/* Add / Edit Event Modal matching Image 2 */}
      <AddEditEventModal
        open={isAddEditOpen}
        event={editingEvent}
        onClose={() => {
          setIsAddEditOpen(false);
          setEditingEvent(null);
        }}
        onEventSaved={handleEventSaved}
      />

      {/* Delete Event Modal matching Image 3 */}
      <DeleteEventModal
        open={Boolean(deletingEvent)}
        event={deletingEvent}
        onClose={() => setDeletingEvent(null)}
        onDeleted={handleEventDeleted}
      />

      {/* Toast Feedback Notification */}
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
    </div>
  );
}

