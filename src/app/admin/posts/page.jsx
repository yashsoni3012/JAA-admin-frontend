'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  PlayCircle,
  FileText,
  Eye,
  CheckCircle2,
  X,
  AlertCircle,
} from 'lucide-react';
import Avatar from '@/components/common/Avatar';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';
import CreatePostView from '@/components/posts/CreatePostView';
import ViewPostView from '@/components/posts/ViewPostView';
import DeletePostModal from '@/components/posts/DeletePostModal';
import {
  getPosts,
  getPostById,
  deletePost,
  getMediaUrl,
  detectPostType,
} from '@/services/post.service';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'ALL', label: 'All' },
  { id: 'JAA', label: 'JAA' },
  { id: 'PHOTOS', label: 'Photos' },
  { id: 'VIDEOS', label: 'Videos' },
  { id: 'NOTICES', label: 'Notices' },
  { id: 'EVENTS', label: 'Events' },
];

const PAGE_SIZES = [5, 10, 20, 50];

export default function PostsPage() {
  // Navigation / View state: 'LIST' | 'CREATE' | 'VIEW'
  const [currentView, setCurrentView] = useState('LIST');
  const [selectedPostDetail, setSelectedPostDetail] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Data state
  const [posts, setPosts] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  // Filters state
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('ALL');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [dateFilter, setDateFilter] = useState('');
  const [showDateInput, setShowDateInput] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Delete modal state
  const [deletingPost, setDeletingPost] = useState(null);

  // Toast state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Load posts from API
  const loadPosts = useCallback(
    async (targetPage = 1, targetLimit = 10, query = '', type = 'ALL') => {
      setIsFetching(true);
      try {
        const mediaTypeParam =
          type !== 'ALL' && type !== 'JAA' && type !== 'EVENTS'
            ? type === 'PHOTOS'
              ? 'Photo'
              : type === 'VIDEOS'
              ? 'Video'
              : type === 'NOTICES'
              ? 'Notice'
              : type
            : '';

        const res = await getPosts({
          page: targetPage,
          limit: targetLimit,
          search: query,
          mediaType: mediaTypeParam,
        });

        setPosts(res.posts || []);
        if (res.pagination) {
          setPagination({
            total: res.pagination.total ?? res.posts.length,
            page: res.pagination.page ?? targetPage,
            limit: res.pagination.limit ?? targetLimit,
            totalPages:
              res.pagination.totalPages ??
              Math.max(1, Math.ceil((res.pagination.total ?? res.posts.length) / targetLimit)),
          });
        }
      } catch (err) {
        console.error('Failed to load posts:', err);
      } finally {
        setIsLoading(false);
        setIsFetching(false);
      }
    },
    []
  );

  useEffect(() => {
    loadPosts(page, pageSize, debouncedSearch, activeTab);
  }, [loadPosts, page, pageSize, debouncedSearch, activeTab]);

  // Handle clicking "View" button -> fetches ID wise API GET /api/admin/posts/:id
  const handleViewPost = async (postItem) => {
    const id = postItem.id;
    setIsLoadingDetail(true);
    try {
      const detail = await getPostById(id);
      setSelectedPostDetail(detail);
      setCurrentView('VIEW');
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Failed to fetch post details:', err);
      showToast(err.message || 'Failed to fetch post details', 'error');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Handle post created
  const handlePostCreated = (newPost) => {
    showToast('Post published successfully!');
    setCurrentView('LIST');
    loadPosts(1, pageSize, debouncedSearch, activeTab);
  };

  // Handle delete post confirm
  const handleDeletePostConfirm = async (id) => {
    await deletePost(id);
    showToast('Post deleted successfully.');
    setDeletingPost(null);
    if (currentView === 'VIEW') {
      setCurrentView('LIST');
      setSelectedPostDetail(null);
    }
    loadPosts(page, pageSize, debouncedSearch, activeTab);
  };

  // Compute tab counts
  const tabCounts = useMemo(() => {
    let all = pagination.total || posts.length;
    let jaa = 0;
    let photos = 0;
    let videos = 0;
    let notices = 0;
    let events = 0;

    posts.forEach((p) => {
      const type = detectPostType(p);
      if (type === 'Photo') photos++;
      if (type === 'Video') videos++;
      if (type === 'Notice') notices++;
      const author = (p.member?.name || p.member?.business || '').toLowerCase();
      if (author.includes('jaa') || author.includes('jeweller') || author.includes('admin')) jaa++;
      const title = (p.title || '').toLowerCase();
      if (title.includes('event') || title.includes('expo') || title.includes('agm')) events++;
    });

    return {
      all: Math.max(all, 1),
      jaa: Math.max(jaa, 0),
      photos: Math.max(photos, 0),
      videos: Math.max(videos, 0),
      notices: Math.max(notices, 0),
      events: Math.max(events, 0),
    };
  }, [posts, pagination.total]);

  // Client-side filtering by active tab & dropdown type
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const type = detectPostType(p);

      // Tab filter
      if (activeTab === 'PHOTOS' && type !== 'Photo') return false;
      if (activeTab === 'VIDEOS' && type !== 'Video') return false;
      if (activeTab === 'NOTICES' && type !== 'Notice') return false;
      if (activeTab === 'JAA') {
        const author = (p.member?.name || p.member?.business || '').toLowerCase();
        if (!author.includes('jaa') && !author.includes('jeweller') && !author.includes('admin')) {
          return false;
        }
      }
      if (activeTab === 'EVENTS') {
        const title = (p.title || '').toLowerCase();
        if (!title.includes('event') && !title.includes('expo') && !title.includes('agm')) {
          return false;
        }
      }

      // Dropdown type filter
      if (selectedTypeFilter !== 'ALL' && type !== selectedTypeFilter) {
        return false;
      }

      // Date filter if applied
      if (dateFilter) {
        const created = String(p.createdAt || '');
        if (!created.includes(dateFilter)) return false;
      }

      return true;
    });
  }, [posts, activeTab, selectedTypeFilter, dateFilter]);

  // Pagination calculation
  const totalItems = filteredPosts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedList = filteredPosts.slice(startIndex, startIndex + pageSize);

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

  // Helper for rendering post type pill badge matching Image 1
  const renderPostTypeBadge = (post) => {
    const type = detectPostType(post);
    switch (type) {
      case 'Video':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200">
            <PlayCircle className="h-3.5 w-3.5" />
            <span>Video</span>
          </span>
        );
      case 'Notice':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
            <FileText className="h-3.5 w-3.5" />
            <span>Notice</span>
          </span>
        );
      case 'Photo':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#2832A4] border border-blue-200">
            <ImageIcon className="h-3.5 w-3.5" />
            <span>Photo</span>
          </span>
        );
    }
  };

  // If in CREATE view, show CreatePostView matching Image 2
  if (currentView === 'CREATE') {
    return (
      <CreatePostView
        onBack={() => setCurrentView('LIST')}
        onPostCreated={handlePostCreated}
      />
    );
  }

  // If in VIEW view, show ViewPostView matching Image 3
  if (currentView === 'VIEW' && selectedPostDetail) {
    return (
      <>
        <ViewPostView
          post={selectedPostDetail}
          onBack={() => {
            setCurrentView('LIST');
            setSelectedPostDetail(null);
          }}
          onDelete={(post) => setDeletingPost(post)}
        />
        <DeletePostModal
          open={Boolean(deletingPost)}
          post={deletingPost}
          onClose={() => setDeletingPost(null)}
          onConfirm={handleDeletePostConfirm}
        />
      </>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#1B1F3B] text-white px-5 py-3.5 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Posts Card matching Image 1 */}
      <section className="rounded-3xl border border-white bg-white p-6 md:p-8 shadow-card space-y-6">
        {/* Top Header Row: Title & + Create Post Button matching Image 1 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
              Posts
            </h2>
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={() => setCurrentView('CREATE')}
            className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold shadow-md shadow-[#2832A4]/20"
          >
            <Plus className="h-4 w-4" />
            <span>Create Post</span>
          </Button>
        </div>

        {/* TABS ROW matching Image 1 */}
        <div className="flex border-b border-slate-100 overflow-x-auto no-scrollbar gap-8">
          {TABS.map((tab) => {
            const count =
              tab.id === 'ALL'
                ? tabCounts.all
                : tab.id === 'JAA'
                ? tabCounts.jaa
                : tab.id === 'PHOTOS'
                ? tabCounts.photos
                : tab.id === 'VIDEOS'
                ? tabCounts.videos
                : tab.id === 'NOTICES'
                ? tabCounts.notices
                : tabCounts.events;

            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setPage(1);
                }}
                className={cn(
                  'pb-3.5 text-sm font-semibold transition whitespace-nowrap relative',
                  isActive
                    ? 'text-[#2832A4]'
                    : 'text-slate-500 hover:text-slate-700 font-medium'
                )}
              >
                {tab.label}({count})
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2832A4] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* CONTROLS BAR: Search, Type Filter & Date Range matching Image 1 */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search post by title, type or author..."
              className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-ink placeholder:text-slate-400 shadow-xs focus:border-[#2832A4] focus:outline-none focus:ring-4 focus:ring-[#2832A4]/10 transition"
            />
          </div>

          {/* Right Controls: Type Filter Dropdown & Date Picker */}
          <div className="flex items-center gap-3 self-end lg:self-auto">
            {/* Type Filter Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTypeDropdown((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition"
              >
                <span>
                  {selectedTypeFilter === 'ALL'
                    ? 'All Types'
                    : selectedTypeFilter}
                </span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {showTypeDropdown && (
                <div className="absolute right-0 mt-2 z-30 w-44 rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl animate-in fade-in duration-150 space-y-1">
                  {['ALL', 'Photo', 'Video', 'Notice'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setSelectedTypeFilter(t);
                        setShowTypeDropdown(false);
                        setPage(1);
                      }}
                      className={cn(
                        'w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold transition',
                        selectedTypeFilter === t
                          ? 'bg-blue-50 text-[#2832A4]'
                          : 'text-slate-700 hover:bg-slate-50'
                      )}
                    >
                      {t === 'ALL' ? 'All Types' : t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date Range Selector matching Image 1 */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDateInput((prev) => !prev)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs sm:text-sm font-semibold shadow-xs transition',
                  dateFilter
                    ? 'border-[#2832A4] bg-blue-50/50 text-[#2832A4]'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                )}
              >
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>{dateFilter ? `Date: ${dateFilter}` : 'Select Date Range'}</span>
              </button>

              {showDateInput && (
                <div className="absolute right-0 mt-2 z-30 w-64 rounded-2xl border border-slate-100 bg-white p-3 shadow-2xl animate-in fade-in duration-150 space-y-3">
                  <p className="text-xs font-bold text-slate-500">Filter by Date</p>
                  <input
                    type="date"
                    onChange={(e) => {
                      if (e.target.value) {
                        const parts = e.target.value.split('-');
                        setDateFilter(`${parts[2]}-${parts[1]}-${parts[0]}`);
                      } else {
                        setDateFilter('');
                      }
                      setShowDateInput(false);
                    }}
                    className="w-full rounded-xl border border-slate-200 p-2 text-xs text-slate-700 focus:outline-none focus:border-[#2832A4]"
                  />
                  {dateFilter && (
                    <button
                      type="button"
                      onClick={() => {
                        setDateFilter('');
                        setShowDateInput(false);
                      }}
                      className="text-xs text-red-500 font-semibold hover:underline block"
                    >
                      Clear Date Filter
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* POSTS TABLE LIST matching Image 1 */}
        {isLoading && posts.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader label="Loading posts..." />
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title="No posts found"
              description="No posts match your search or filter criteria. Click '+ Create Post' to create one."
            />
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse min-w-[900px]">
              {/* Table Header matching Image 1 */}
              <thead>
                <tr className="bg-[#F4F7FF] text-slate-500 text-[11px] font-bold uppercase tracking-wider rounded-2xl">
                  <th className="py-3.5 pl-6 pr-4 rounded-l-2xl">POST</th>
                  <th className="py-3.5 px-4">TYPE</th>
                  <th className="py-3.5 px-4">POSTED BY</th>
                  <th className="py-3.5 px-4">DATE & TIME</th>
                  <th className="py-3.5 px-4">STATUS</th>
                  <th className="py-3.5 pr-6 pl-4 text-center rounded-r-2xl">ACTION</th>
                </tr>
              </thead>

              {/* Table Body matching Image 1 */}
              <tbody className="divide-y divide-slate-100 text-sm">
                {paginatedList.map((item) => {
                  const mediaItem = item.media?.[0];
                  const mediaUrl = mediaItem ? getMediaUrl(mediaItem.url || mediaItem) : null;
                  const isDoc =
                    mediaItem?.fileType?.includes('pdf') ||
                    mediaUrl?.toLowerCase().endsWith('.pdf') ||
                    detectPostType(item) === 'Notice';

                  const authorName = item.member?.name || 'Admin';
                  const authorSub =
                    item.member?.email || item.member?.business || item.member?.mobile || '';
                  const authorAvatar = getMediaUrl(item.member?.avatar);
                  const isPublished = (item.status || 'published').toLowerCase() === 'published';

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* 1. Post: Thumbnail + Title + Snippet */}
                      <td className="py-4 pl-6 pr-4">
                        <div className="flex items-center gap-3.5 max-w-sm">
                          {isDoc ? (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
                              <FileText className="h-6 w-6 stroke-[1.8]" />
                            </div>
                          ) : mediaUrl ? (
                            <img
                              src={mediaUrl}
                              alt={item.title}
                              className="h-12 w-12 shrink-0 rounded-xl object-cover border border-slate-200 shadow-xs"
                            />
                          ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#2832A4] font-bold text-xs border border-[#D4DEFE]">
                              JAA
                            </div>
                          )}

                          <div className="min-w-0">
                            <h4 className="font-bold text-ink truncate text-sm">
                              {item.title}
                            </h4>
                            <p className="text-xs text-slate-400 truncate mt-0.5 line-clamp-1">
                              {item.description || 'All members are requested to review.'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 2. Type */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {renderPostTypeBadge(item)}
                      </td>

                      {/* 3. Posted By */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={authorName}
                            src={authorAvatar}
                            size="md"
                            className="h-10 w-10 shrink-0 shadow-xs"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-ink truncate text-sm">
                              {authorName}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {authorSub}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 4. Date & Time */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-600 font-medium">
                        {item.createdAt || '24 May 2026'}
                      </td>

                      {/* 5. Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 font-semibold text-xs">
                          <span
                            className={cn(
                              'h-2 w-2 rounded-full',
                              isPublished ? 'bg-emerald-500' : 'bg-amber-500'
                            )}
                          />
                          <span className={isPublished ? 'text-emerald-600' : 'text-amber-600'}>
                            {isPublished ? 'Published' : 'Draft'}
                          </span>
                        </span>
                      </td>

                      {/* 6. Actions: Eye Icon Button matching Event page & Delete */}
                      <td className="py-4 pr-6 pl-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          {/* View Details Eye Icon Button matching Event page */}
                          <button
                            type="button"
                            onClick={() => handleViewPost(item)}
                            disabled={isLoadingDetail}
                            title="View Details"
                            aria-label="View Details"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2832A4] bg-white text-[#2832A4] transition-all hover:bg-blue-50 hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-[#2832A4]/20 disabled:opacity-50"
                          >
                            <Eye className="h-4 w-4 stroke-[2]" />
                          </button>

                          {/* Delete Post Button */}
                          <button
                            type="button"
                            onClick={() => setDeletingPost(item)}
                            title="Delete Post"
                            aria-label="Delete Post"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-red-100"
                          >
                            <Trash2 className="h-4 w-4" />
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

        {/* FOOTER: Showing entries count & Button Paginations matching Image 1 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-slate-100 text-sm text-slate-500">
          <p>
            Showing {totalItems === 0 ? 0 : startIndex + 1} to{' '}
            {Math.min(startIndex + paginatedList.length, totalItems)} of {totalItems} entries
          </p>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Pagination Button Group */}
            <nav aria-label="Posts pagination" className="flex items-center gap-1.5">
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

      {/* Delete Post Modal */}
      <DeletePostModal
        open={Boolean(deletingPost)}
        post={deletingPost}
        onClose={() => setDeletingPost(null)}
        onConfirm={handleDeletePostConfirm}
      />
    </div>
  );
}

