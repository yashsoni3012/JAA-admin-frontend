'use client';

import { cn } from '@/lib/utils';

// Base animated skeleton element
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'skeleton-shimmer animate-pulse rounded-2xl',
        className
      )}
      {...props}
    />
  );
}

// Table Skeleton with animated column headers and rows
export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="w-full space-y-3">
      {/* Table Header Skeleton */}
      <div className="flex items-center gap-4 py-3.5 px-6 bg-slate-100/90 rounded-2xl border border-slate-100">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn(
              'h-3.5 rounded-md',
              i === 0 ? 'w-24 sm:w-32' : i === cols - 1 ? 'w-16 ml-auto' : 'flex-1'
            )}
          />
        ))}
      </div>

      {/* Table Rows Skeleton */}
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            className="flex items-center gap-4 py-4 px-6 bg-white rounded-2xl border border-slate-100/90 shadow-2xs"
          >
            {/* First col with icon / avatar indicator */}
            <div className="flex items-center gap-3 w-40 sm:w-56 shrink-0">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <Skeleton className="h-3.5 w-3/4 rounded-md" />
                <Skeleton className="h-2.5 w-1/2 rounded-md" />
              </div>
            </div>

            {/* Middle columns */}
            {Array.from({ length: Math.max(1, cols - 2) }).map((_, c) => (
              <div key={c} className="flex-1 min-w-0">
                <Skeleton className="h-3.5 w-4/5 rounded-md" />
              </div>
            ))}

            {/* Action buttons col */}
            <div className="flex items-center justify-end gap-2 shrink-0">
              <Skeleton className="h-8 w-16 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Stat Card Skeleton
export function CardSkeleton() {
  return (
    <div className="rounded-3xl border border-white bg-white p-6 shadow-card space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-2xl" />
      </div>
      <Skeleton className="h-7 w-20 rounded-xl" />
      <Skeleton className="h-3 w-36 rounded-md" />
    </div>
  );
}

// Groups List Skeleton
export function GroupListSkeleton({ rows = 5 }) {
  return (
    <div className="space-y-3.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
        >
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <Skeleton className="h-12 w-12 sm:h-14 sm:w-14 rounded-full shrink-0" />
            <div className="space-y-2 flex-1 max-w-sm">
              <Skeleton className="h-4 w-44 rounded-md" />
              <Skeleton className="h-3 w-28 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <Skeleton className="h-8 w-16 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Events List Skeleton
export function EventListSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl sm:rounded-3xl border border-slate-100 bg-white p-4 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4 flex-1">
            <Skeleton className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl shrink-0" />
            <div className="space-y-2 flex-1 max-w-md">
              <Skeleton className="h-4 w-48 rounded-md" />
              <Skeleton className="h-3 w-72 rounded-md" />
              <div className="flex items-center gap-4 pt-1">
                <Skeleton className="h-3 w-24 rounded-md" />
                <Skeleton className="h-3 w-24 rounded-md" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end lg:self-auto">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Committee Position Accordion Skeleton
export function CommitteeSkeleton({ rows = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 sm:px-6 sm:py-4 bg-[#F8FAFC]">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-36 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
          <div className="p-4 sm:p-6 bg-white border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <Skeleton className="h-11 w-11 rounded-full shrink-0" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-28 rounded-md" />
                    <Skeleton className="h-3 w-36 rounded-md" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
              <div className="p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <Skeleton className="h-11 w-11 rounded-full shrink-0" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-3.5 w-28 rounded-md" />
                    <Skeleton className="h-3 w-36 rounded-md" />
                  </div>
                </div>
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Complete Admin Page Skeleton (Used in loading.jsx and AuthGuard during refresh)
export function AdminPageSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48 rounded-xl" />
          <Skeleton className="h-3.5 w-72 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Table Card Skeleton */}
      <div className="rounded-3xl border border-white bg-white p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between pb-2">
          <Skeleton className="h-5 w-36 rounded-xl" />
          <Skeleton className="h-9 w-60 rounded-full" />
        </div>
        <TableSkeleton rows={5} cols={5} />
      </div>
    </div>
  );
}
