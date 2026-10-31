'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  Image as ImageIcon,
  PlayCircle,
  FileText,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MapPin,
  Calendar,
  Eye,
  Download,
  Maximize2,
} from 'lucide-react';
import Avatar from '@/components/common/Avatar';
import Button from '@/components/common/Button';
import PostImageLightboxModal from '@/components/posts/PostImageLightboxModal';
import { getMediaUrl, detectPostType } from '@/services/post.service';
import { cn } from '@/lib/utils';

export default function ViewPostView({ post, onBack, onDelete }) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxInitialIndex, setLightboxInitialIndex] = useState(0);

  if (!post) return null;

  const mediaList = Array.isArray(post.media) && post.media.length > 0 ? post.media : [];
  const activeMedia = mediaList[activeMediaIndex] || null;
  const activeMediaUrl = activeMedia ? getMediaUrl(activeMedia.url || activeMedia) : null;
  const isVideo =
    activeMedia?.fileType?.startsWith('video/') ||
    activeMediaUrl?.toLowerCase().endsWith('.mp4') ||
    activeMediaUrl?.toLowerCase().endsWith('.mov') ||
    activeMediaUrl?.toLowerCase().endsWith('.webm');
  const isPdf =
    activeMedia?.fileType?.includes('pdf') ||
    activeMediaUrl?.toLowerCase().endsWith('.pdf') ||
    activeMedia?.fileType?.includes('document');

  const postType = detectPostType(post);
  const memberName = post.member?.name || 'Admin';
  const memberEmail = post.member?.email || post.member?.business || post.member?.mobile || '';
  const memberAvatar = getMediaUrl(post.member?.avatar);
  const isPublished = (post.status || 'published').toLowerCase() === 'published';

  const renderPostTypeBadge = (type) => {
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

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Card matching Image 3 */}
      <section className="rounded-3xl border border-white bg-white p-6 md:p-8 shadow-card space-y-6">
        {/* Header Row: Title & Back Button */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h2 className="text-xl md:text-2xl font-bold text-ink tracking-tight">
            View Post
          </h2>

          {/* Back Button matching Image 3 */}
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </div>

        {/* 2-Column Content Grid matching Image 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Post Content & Media (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Author Row matching Image 3 */}
            <div className="flex items-center gap-3.5">
              <Avatar
                name={memberName}
                src={memberAvatar}
                size="md"
                className="h-12 w-12 shrink-0 shadow-xs"
              />
              <div className="min-w-0">
                <h4 className="text-sm md:text-base font-bold text-ink truncate">
                  {memberName}
                </h4>
                <p className="text-xs text-slate-400 truncate">
                  {memberEmail}
                </p>
              </div>
            </div>

            {/* Post Title & Subtitle matching Image 3 */}
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-ink tracking-tight">
                {post.title}
              </h3>
              {post.description && (
                <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                  {post.description.split('\n')[0]}
                </p>
              )}
            </div>

            {/* Main Media Display Box matching Image 3 */}
            {activeMediaUrl && (
              <div
                onClick={() => {
                  if (!isVideo && !isPdf) {
                    setLightboxInitialIndex(activeMediaIndex);
                    setIsLightboxOpen(true);
                  }
                }}
                className={cn(
                  'relative rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center min-h-[280px] max-h-[480px] shadow-sm group select-none',
                  !isVideo && !isPdf && 'cursor-pointer'
                )}
              >
                {isVideo ? (
                  <video
                    src={activeMediaUrl}
                    controls
                    className="w-full max-h-[480px] object-contain rounded-2xl"
                  />
                ) : isPdf ? (
                  <div className="flex flex-col items-center justify-center p-12 text-white text-center space-y-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      <FileText className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Notice Document (PDF)</p>
                      <p className="text-xs text-slate-400 mt-0.5">{activeMediaUrl.split('/').pop()}</p>
                    </div>
                    <a
                      href={activeMediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-white text-slate-900 px-5 py-2 text-xs font-semibold hover:bg-slate-100 transition shadow-md"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Open Document</span>
                    </a>
                  </div>
                ) : (
                  <>
                    <img
                      src={activeMediaUrl}
                      alt={post.title}
                      className="w-full max-h-[480px] object-contain rounded-2xl transition duration-300 group-hover:scale-[1.02]"
                    />
                    {/* Hover Hint Overlay to Slide/Expand */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <div className="bg-black/60 backdrop-blur-xs text-white px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 shadow-lg">
                        <Maximize2 className="h-4 w-4" />
                        <span>Click to view & slide</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Counter Badge on Top-Right matching Image 3 (e.g. 1/4) */}
                {mediaList.length > 0 && (
                  <div className="absolute top-3 right-3 rounded-full bg-black/60 backdrop-blur-xs px-3 py-1 text-xs font-bold text-white select-none shadow-sm z-10">
                    {activeMediaIndex + 1}/{mediaList.length}
                  </div>
                )}

                {/* Next/Prev Navigation Arrows if multiple media */}
                {mediaList.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMediaIndex((prev) =>
                          prev === 0 ? mediaList.length - 1 : prev - 1
                        );
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/75 transition opacity-0 group-hover:opacity-100 z-10"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMediaIndex((prev) =>
                          prev === mediaList.length - 1 ? 0 : prev + 1
                        );
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/75 transition opacity-0 group-hover:opacity-100 z-10"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Description Section matching Image 3 */}
            <div className="space-y-2 pt-2">
              <h4 className="text-sm font-bold text-ink uppercase tracking-wider">
                Description
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {post.description || 'No description provided for this post.'}
              </p>
            </div>

            {/* Attachments Section matching Image 3 */}
            {mediaList.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-sm font-bold text-ink uppercase tracking-wider">
                  Attachment
                </h4>
                <div className="flex flex-wrap gap-3">
                  {mediaList.map((m, idx) => {
                    const mUrl = getMediaUrl(m.url || m);
                    const isSelected = activeMediaIndex === idx;
                    const mIsPdf =
                      m.fileType?.includes('pdf') || mUrl.toLowerCase().endsWith('.pdf');

                    return (
                      <div
                        key={idx}
                        onClick={() => {
                          setActiveMediaIndex(idx);
                          if (!mIsPdf) {
                            setLightboxInitialIndex(idx);
                            setIsLightboxOpen(true);
                          }
                        }}
                        className={cn(
                          'relative h-16 w-16 rounded-xl overflow-hidden cursor-pointer transition border-2 flex items-center justify-center bg-slate-100 group shadow-xs hover:scale-105',
                          isSelected
                            ? 'border-[#2832A4] ring-2 ring-[#2832A4]/20'
                            : 'border-slate-200 hover:border-[#2832A4]/50'
                        )}
                      >
                        {mIsPdf ? (
                          <div className="flex flex-col items-center justify-center p-1 text-amber-600">
                            <FileText className="h-6 w-6" />
                            <span className="text-[9px] font-bold mt-0.5">PDF</span>
                          </div>
                        ) : (
                          <img
                            src={mUrl}
                            alt={`Attachment ${idx + 1}`}
                            className="h-full w-full object-cover transition duration-200"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Personal Information & Status & Actions matching Image 3 (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-8 lg:pl-4">
            {/* 1. Personal Information Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-800 tracking-tight">
                Personal Information
              </h4>

              <div className="space-y-4 text-xs sm:text-sm">
                {/* Post Type */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Post Type</span>
                  <div>{renderPostTypeBadge(postType)}</div>
                </div>

                {/* Posted By */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Posted By</span>
                  <div className="flex items-center gap-2">
                    <Avatar
                      name={memberName}
                      src={memberAvatar}
                      size="sm"
                      className="h-6 w-6 shrink-0"
                    />
                    <span className="font-semibold text-ink truncate max-w-[140px]">
                      {memberName}
                    </span>
                  </div>
                </div>

                {/* Posted On */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Posted On</span>
                  <span className="font-semibold text-ink">
                    {post.createdAt || '24 May 2026'}
                  </span>
                </div>

                {/* Location if present */}
                {post.location && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Location</span>
                    <span className="font-semibold text-ink truncate max-w-[150px]">
                      {post.location}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Status & Actions Section */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-800 tracking-tight">
                Status & Actions
              </h4>

              {/* Current Status */}
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-400 font-medium">Current Status</span>
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
              </div>

              {/* Delete Post Button matching Image 3 */}
              <div className="pt-3">
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => onDelete && onDelete(post)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50/70 hover:bg-red-100/80 px-4 py-2.5 text-xs sm:text-sm font-semibold text-red-600 transition shadow-xs focus:outline-none focus:ring-2 focus:ring-red-200"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Post</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full-Screen Image Lightbox Slider Modal matching reference image */}
      <PostImageLightboxModal
        open={isLightboxOpen}
        mediaList={mediaList}
        initialIndex={lightboxInitialIndex}
        onClose={() => setIsLightboxOpen(false)}
        postTitle={post.title}
      />
    </div>
  );
}

