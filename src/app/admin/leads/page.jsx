'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  ArrowDownCircle,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  X,
} from 'lucide-react';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';
import ViewLeadView from '@/components/leads/ViewLeadView';
import DeleteLeadModal from '@/components/leads/DeleteLeadModal';
import {
  getLeads,
  getLeadById,
  deleteLead,
  formatDisplayDate,
} from '@/services/lead.service';
import { cn } from '@/lib/utils';

const PAGE_SIZES = [5, 10, 20, 50];

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
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

  // VIEW vs LIST navigation
  const [currentView, setCurrentView] = useState('LIST'); // 'LIST' | 'VIEW'
  const [selectedLead, setSelectedLead] = useState(null);
  const [loadingDetailId, setLoadingDetailId] = useState(null);

  // Deletion state
  const [deletingLead, setDeletingLead] = useState(null);
  const [toast, setToast] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Load leads from backend
  const loadLeads = useCallback(
    async (targetPage = 1, targetSize = 10, targetSearch = '') => {
      setIsFetching(true);
      try {
        const res = await getLeads({
          page: targetPage,
          limit: targetSize,
          search: targetSearch,
        });

        setLeads(res.leads || []);
        if (res.pagination) {
          setPagination({
            total: res.pagination.total ?? res.leads.length,
            page: res.pagination.page ?? targetPage,
            limit: res.pagination.limit ?? targetSize,
            totalPages:
              res.pagination.totalPages ??
              Math.max(1, Math.ceil((res.pagination.total ?? res.leads.length) / targetSize)),
            hasNext: Boolean(res.pagination.hasNext),
            hasPrev: Boolean(res.pagination.hasPrev),
          });
        }
      } catch (err) {
        console.error('Failed to load leads:', err);
      } finally {
        setIsLoading(false);
        setIsFetching(false);
      }
    },
    []
  );

  useEffect(() => {
    loadLeads(page, pageSize, debouncedSearch);
  }, [loadLeads, page, pageSize, debouncedSearch]);

  // When clicking on View button: call id-wise API http://localhost:5000/api/admin/leads/:id
  const handleViewLead = async (leadItem) => {
    setLoadingDetailId(leadItem.id);
    try {
      const detailedLead = await getLeadById(leadItem.id);
      setSelectedLead(detailedLead || leadItem);
      setCurrentView('VIEW');
    } catch (err) {
      console.error('Failed to fetch lead details:', err);
      // Fallback to current item if single fetch encounters an error
      setSelectedLead(leadItem);
      setCurrentView('VIEW');
    } finally {
      setLoadingDetailId(null);
    }
  };

  // Delete lead handler
  const handleDeleteConfirm = async (id) => {
    await deleteLead(id);
    setToast('Lead deleted successfully.');
    setTimeout(() => setToast(null), 3500);
    loadLeads(page, pageSize, debouncedSearch);
  };

  // Export current leads to CSV
  const handleExportCsv = () => {
    if (!filteredLeads || filteredLeads.length === 0) return;
    const headers = [
      'ID',
      'Lead Title',
      'Source',
      'Description',
      'Member Name',
      'Business Name',
      'Mobile Number',
      'City',
      'Added On',
      'Status',
    ];
    const rows = filteredLeads.map((item) => {
      const m = item.member || {};
      return [
        item.id,
        `"${(item.title || '').replace(/"/g, '""')}"`,
        `"${(item.source || 'WhatsApp').replace(/"/g, '""')}"`,
        `"${(item.description || '').replace(/"/g, '""')}"`,
        `"${(m.name || '').replace(/"/g, '""')}"`,
        `"${(m.business || '').replace(/"/g, '""')}"`,
        `"${(m.mobile || '').replace(/"/g, '""')}"`,
        `"${(m.city || '').replace(/"/g, '""')}"`,
        `"${item.displayDate || formatDisplayDate(item.createdAt) || ''}"`,
        `"${item.status || 'ACTIVE'}"`,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Leads-Export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setToast('Leads exported to CSV successfully.');
    setTimeout(() => setToast(null), 3500);
  };

  // Client-side search filtering fallback for instant responsiveness
  const filteredLeads = useMemo(() => {
    if (!debouncedSearch.trim()) return leads;
    const q = debouncedSearch.toLowerCase().trim();
    return leads.filter((l) => {
      const title = (l.title || '').toLowerCase();
      const source = (l.source || '').toLowerCase();
      const desc = (l.description || '').toLowerCase();
      const status = (l.status || '').toLowerCase();
      const name = (l.member?.name || '').toLowerCase();
      const business = (l.member?.business || '').toLowerCase();
      const mobile = (l.member?.mobile || '').toLowerCase();
      const city = (l.member?.city || '').toLowerCase();
      return (
        title.includes(q) ||
        source.includes(q) ||
        desc.includes(q) ||
        status.includes(q) ||
        name.includes(q) ||
        business.includes(q) ||
        mobile.includes(q) ||
        city.includes(q)
      );
    });
  }, [leads, debouncedSearch]);

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

  // Format mobile numbers with +91 if needed
  const formatMobileNumber = (num) => {
    if (!num || num === '-') return '+91 9988776655';
    const clean = String(num).trim();
    if (clean.startsWith('+')) return clean;
    return `+91 ${clean}`;
  };

  // IF IN VIEW MODE: RENDER VIEW LEAD VIEW MATCHING IMAGE 2
  if (currentView === 'VIEW' && selectedLead) {
    return (
      <ViewLeadView
        lead={selectedLead}
        onBack={() => {
          setCurrentView('LIST');
          setSelectedLead(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* MAIN CONTAINER MATCHING IMAGE 1 */}
      <section className="rounded-3xl border border-white bg-white p-6 md:p-8 shadow-card space-y-6">
        {/* Title on Left + Export CSV Button on Right (replaces Add Leads) */}
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl md:text-2xl font-bold text-[#1B1F3B] tracking-tight">
            Leads
          </h2>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 rounded-full bg-[#E02B20] hover:bg-[#c9241a] text-white px-5 py-2.5 text-xs md:text-sm font-semibold shadow-md shadow-red-500/20 transition cursor-pointer active:scale-95 shrink-0"
          >
            <ArrowDownCircle className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* CONTROLS BAR: Search Input */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, description, source, member..."
              className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-ink placeholder:text-slate-400 shadow-xs focus:border-[#2832A4] focus:outline-none focus:ring-4 focus:ring-[#2832A4]/10 transition"
            />
          </div>
        </div>

        {/* LEADS TABLE */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader label="Loading leads..." />
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title="No leads found"
              description="No leads match your search criteria. Try a different term or clear the filter."
            />
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              {/* Header */}
              <thead>
                <tr className="border-y border-slate-100 bg-[#F8FAFC] text-[11px] md:text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6 font-bold">LEAD TITLE</th>
                  <th className="py-3.5 px-6 font-bold">DESCRIPTION</th>
                  <th className="py-3.5 px-6 font-bold">ADDED ON</th>
                  <th className="py-3.5 px-6 font-bold text-center">STATUS</th>
                  <th className="py-3.5 px-6 font-bold text-center">ACTION</th>
                </tr>
              </thead>

              {/* Body */}
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredLeads.map((item) => {
                  const member = item.member || {};
                  const displayDate =
                    item.displayDate || formatDisplayDate(item.createdAt) || '-';
                  const displayStatus = item.status || 'ACTIVE';
                  const isActive = displayStatus.toUpperCase() === 'ACTIVE';

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Lead Title */}
                      <td className="py-4 px-6">
                        <div
                          className="font-semibold text-slate-900 text-sm md:text-[14px] line-clamp-1 max-w-xs md:max-w-sm"
                          title={item.title}
                        >
                          {item.title || 'Untitled Lead'}
                        </div>
                        {member.name && (
                          <div className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">
                            By {member.name}
                            {member.business && member.business !== '-'
                              ? ` • ${member.business}`
                              : ''}
                          </div>
                        )}
                      </td>

                      {/* Description (some sentence then...) */}
                      <td className="py-4 px-6 max-w-xs md:max-w-md">
                        <p
                          className="text-slate-600 text-xs md:text-sm line-clamp-1 leading-relaxed truncate"
                          title={item.description || ''}
                        >
                          {item.description
                            ? item.description.length > 80
                              ? `${item.description.slice(0, 80)}...`
                              : item.description
                            : '-'}
                        </p>
                      </td>

                      {/* Added On (created at field date) */}
                      <td className="py-4 px-6 text-slate-600 whitespace-nowrap text-xs md:text-sm">
                        {displayDate}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          )}
                        >
                          <span
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              isActive ? 'bg-emerald-500' : 'bg-slate-400'
                            )}
                          />
                          {displayStatus}
                        </span>
                      </td>

                      {/* Action: View button matching Event Page + Delete Trash button */}
                      <td className="py-4 px-6 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          {/* View Details Eye Icon Button (same as event page) */}
                          <button
                            type="button"
                            onClick={() => handleViewLead(item)}
                            disabled={loadingDetailId === item.id}
                            title="View Details"
                            aria-label="View Details"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2832A4] bg-white text-[#2832A4] transition-all hover:bg-blue-50 hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-[#2832A4]/20 disabled:opacity-50 cursor-pointer"
                          >
                            {loadingDetailId === item.id ? (
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#2832A4] border-t-transparent" />
                            ) : (
                              <Eye className="h-4 w-4 stroke-[2]" />
                            )}
                          </button>

                          {/* Delete Lead Button */}
                          <button
                            type="button"
                            onClick={() => setDeletingLead(item)}
                            title="Delete Lead"
                            aria-label="Delete Lead"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-500 transition-all hover:bg-red-100 hover:text-red-600 hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-red-100 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4 stroke-[2]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* FOOTER: Pagination controls & page size selector matching Image 1 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-slate-100 text-sm text-slate-500">
          <p>
            Showing {totalItems === 0 ? 0 : startIndex + 1} to{' '}
            {Math.min(startIndex + filteredLeads.length, totalItems)} of {totalItems} entries
          </p>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Pagination Controls */}
            <nav aria-label="Leads pagination" className="flex items-center gap-1.5">
              {/* Previous Button */}
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
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 focus:border-[#2832A4] focus:outline-none cursor-pointer"
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

      {/* Delete Lead Confirmation Modal */}
      <DeleteLeadModal
        open={Boolean(deletingLead)}
        lead={deletingLead}
        onClose={() => setDeletingLead(null)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Floating Toast Notification */}
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
