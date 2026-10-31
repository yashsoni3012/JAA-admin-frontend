'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  RotateCcw,
  FileText,
  PlayCircle,
  Maximize2,
} from 'lucide-react';
import { getMediaUrl } from '@/services/post.service';
import { cn } from '@/lib/utils';

export default function PostImageLightboxModal({
  open,
  mediaList = [],
  initialIndex = 0,
  onClose,
  postTitle = '',
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomScale, setZoomScale] = useState(1);
  const [slideDirection, setSlideDirection] = useState('next'); // 'next' | 'prev'
  const [isAnimating, setIsAnimating] = useState(false);

  // Sync index when initialIndex changes or modal opens
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
      setZoomScale(1);
    }
  }, [open, initialIndex]);

  const total = mediaList.length;
  const currentItem = mediaList[currentIndex] || null;
  const currentUrl = currentItem ? getMediaUrl(currentItem.url || currentItem) : null;
  const isVideo =
    currentItem?.fileType?.startsWith('video/') ||
    currentUrl?.toLowerCase().endsWith('.mp4') ||
    currentUrl?.toLowerCase().endsWith('.mov') ||
    currentUrl?.toLowerCase().endsWith('.webm');
  const isPdf =
    currentItem?.fileType?.includes('pdf') ||
    currentUrl?.toLowerCase().endsWith('.pdf');

  // Next / Prev slide handlers with animation
  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    setSlideDirection('prev');
    setIsAnimating(true);
    setZoomScale(1);
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 250);
  }, [total]);

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    setSlideDirection('next');
    setIsAnimating(true);
    setZoomScale(1);
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 250);
  }, [total]);

  // Zoom handlers
  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => Math.max(prev - 0.25, 0.75));
  };

  const handleResetZoom = () => {
    setZoomScale(1);
  };

  // Keyboard navigation (Arrow keys to slide, Esc to close)
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      } else if (e.key === '-') {
        handleZoomOut();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, handlePrev, handleNext]);

  // Prevent background body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open || !currentItem) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-6 md:p-10 animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      {/* Modal Card matching user image */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-3xl shadow-2xl overflow-visible max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center p-3 sm:p-5 border border-white/20 animate-in zoom-in-95 duration-200"
      >
        {/* CLOSE BUTTON matching image: circular white/pink pill with red 'X' overlapping top right corner */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          title="Close"
          className="absolute -top-3 -right-3 md:-top-4 md:-right-4 z-30 flex h-11 w-11 md:h-12 md:w-12 items-center justify-center rounded-full bg-[#FFEAEB] border-2 border-white text-[#FF4D4F] shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer hover:bg-rose-100"
        >
          <X className="h-5 w-5 stroke-[2.5]" />
        </button>

        {/* LEFT SLIDE ARROW BUTTON */}
        {total > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            title="Previous image (Left arrow)"
            aria-label="Previous image"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-xl border border-slate-200/80 hover:bg-white hover:text-[#2832A4] hover:scale-110 active:scale-95 transition-all"
          >
            <ChevronLeft className="h-6 w-6 stroke-[2.5]" />
          </button>
        )}

        {/* RIGHT SLIDE ARROW BUTTON */}
        {total > 1 && (
          <button
            type="button"
            onClick={handleNext}
            title="Next image (Right arrow)"
            aria-label="Next image"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-xl border border-slate-200/80 hover:bg-white hover:text-[#2832A4] hover:scale-110 active:scale-95 transition-all"
          >
            <ChevronRight className="h-6 w-6 stroke-[2.5]" />
          </button>
        )}

        {/* MEDIA DISPLAY CONTAINER */}
        <div className="relative w-full h-[65vh] sm:h-[72vh] rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center p-2">
          {isVideo ? (
            <video
              src={currentUrl}
              controls
              autoPlay
              className="w-full h-full object-contain rounded-xl"
            />
          ) : isPdf ? (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 shadow-md">
                <FileText className="h-10 w-10 stroke-[1.8]" />
              </div>
              <div>
                <p className="text-base font-bold text-ink">Notice Document (PDF)</p>
                <p className="text-xs text-slate-400 mt-1">{currentUrl.split('/').pop()}</p>
              </div>
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#2832A4] text-white px-6 py-2.5 text-sm font-semibold hover:bg-blue-800 transition shadow-md shadow-blue-500/20"
              >
                <span>Open Document in New Tab</span>
              </a>
            </div>
          ) : (
            <div
              className={cn(
                'w-full h-full flex items-center justify-center transition-transform duration-300 ease-out',
                isAnimating && (slideDirection === 'next' ? 'translate-x-4 opacity-80' : '-translate-x-4 opacity-80')
              )}
            >
              <img
                src={currentUrl}
                alt={postTitle || `Slide ${currentIndex + 1}`}
                style={{
                  transform: `scale(${zoomScale})`,
                  transition: 'transform 0.2s ease-out',
                }}
                className="max-h-full max-w-full object-contain rounded-xl shadow-xs"
              />
            </div>
          )}

          {/* COUNTER BADGE (e.g. 1/4) on Top Left */}
          {total > 1 && (
            <div className="absolute top-4 left-4 z-20 rounded-full bg-black/60 backdrop-blur-xs px-3.5 py-1 text-xs font-bold text-white shadow-md">
              {currentIndex + 1} / {total}
            </div>
          )}

          {/* ZOOM CONTROLS matching image: White rounded pill at Bottom Right with [+] and [-] */}
          {!isVideo && !isPdf && (
            <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1 rounded-2xl bg-white/95 backdrop-blur-xs p-1.5 shadow-xl border border-slate-200/90">
              <button
                type="button"
                onClick={handleZoomIn}
                title="Zoom In (+)"
                aria-label="Zoom In"
                disabled={zoomScale >= 3}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-700 hover:text-[#2832A4] hover:bg-blue-50 transition active:scale-95 disabled:opacity-40"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
              </button>

              <div className="h-4 w-px bg-slate-200" />

              <button
                type="button"
                onClick={handleZoomOut}
                title="Zoom Out (-)"
                aria-label="Zoom Out"
                disabled={zoomScale <= 0.75}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-700 hover:text-[#2832A4] hover:bg-blue-50 transition active:scale-95 disabled:opacity-40"
              >
                <Minus className="h-4 w-4 stroke-[2.5]" />
              </button>

              {zoomScale !== 1 && (
                <>
                  <div className="h-4 w-px bg-slate-200" />
                  <button
                    type="button"
                    onClick={handleResetZoom}
                    title="Reset Zoom"
                    className="flex h-9 items-center gap-1 px-2 rounded-xl text-xs font-bold text-[#2832A4] hover:bg-blue-50 transition"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>{Math.round(zoomScale * 100)}%</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* THUMBNAILS ROW AT BOTTOM IF MULTIPLE IMAGES */}
        {total > 1 && (
          <div className="w-full flex items-center justify-center gap-2 pt-3 overflow-x-auto no-scrollbar">
            {mediaList.map((m, idx) => {
              const thumbUrl = getMediaUrl(m.url || m);
              const isSelected = currentIndex === idx;
              const isThumbPdf =
                m.fileType?.includes('pdf') || thumbUrl.toLowerCase().endsWith('.pdf');

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSlideDirection(idx > currentIndex ? 'next' : 'prev');
                    setCurrentIndex(idx);
                    setZoomScale(1);
                  }}
                  className={cn(
                    'relative h-12 w-12 rounded-xl overflow-hidden border-2 transition-all shrink-0',
                    isSelected
                      ? 'border-[#2832A4] scale-105 shadow-md ring-2 ring-[#2832A4]/20'
                      : 'border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-400'
                  )}
                >
                  {isThumbPdf ? (
                    <div className="h-full w-full bg-amber-50 text-amber-600 flex items-center justify-center text-[10px] font-bold">
                      PDF
                    </div>
                  ) : (
                    <img
                      src={thumbUrl}
                      alt={`Thumb ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

