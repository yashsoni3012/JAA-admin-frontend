'use client';

import { memo } from 'react';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import { Phone, Mail, Building2, Eye, Pencil, Check, X, CreditCard, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// One member card row, laid out responsively for Mobile, Tablet, and Desktop.
// Mobile: Clean touch-friendly card with call/email actions and aligned buttons.
// Tablet & Desktop: 12-column structured table row where actions fit smoothly on one line.
function MemberRowComponent({
  member,
  onView,
  onEdit,
  onApprove,
  onReject,
  onIdCard,
  onDelete,
  onToggleActive,
}) {
  const statusStr = String(member.status || '').toLowerCase();
  const isPending = statusStr === 'pending';
  const isApproved = statusStr === 'approved';
  const isRejected = statusStr === 'rejected';
  const isActive = member.isActive !== undefined ? Boolean(member.isActive) : (statusStr === 'approved' || statusStr === 'active');

  return (
    <li
      onClick={() => onView && onView(member)}
      className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/80 transition-colors cursor-pointer"
    >
      {/* ========================================================= */}
      {/* 1. MOBILE CARD VIEW (< md: hidden on tablet and desktop)   */}
      {/* ========================================================= */}
      <div className="flex flex-col gap-3 p-4 sm:p-5 md:hidden">
        {/* Top Header: Avatar + Identity + Status Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar
              name={member.name}
              src={member.avatar}
              size="md"
              className="h-11 w-11 shrink-0 text-sm font-bold shadow-2xs"
            />
            <div className="min-w-0">
              <p className="text-sm font-bold text-ink truncate">{member.name}</p>
              <p className="text-xs text-slate-500 truncate">{member.business || 'Business Member'}</p>
              {member.membershipId && (
                <span className="inline-block mt-0.5 text-[11px] font-mono text-slate-400">
                  {member.membershipId}
                </span>
              )}
            </div>
          </div>
          <div className="shrink-0 pt-0.5">
            {isApproved ? (
              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onToggleActive) onToggleActive(member, !isActive);
                }}
                title={isActive ? 'Click to make Inactive' : 'Click to make Active'}
                className="inline-flex items-center gap-2 cursor-pointer focus:outline-none select-none transition-opacity active:opacity-80"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
                    isActive ? 'bg-[#2832A4]' : 'bg-slate-300'
                  )}
                >
                  <span
                    className={cn(
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
                      isActive ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </span>
                <span
                  className={cn(
                    'text-xs sm:text-sm font-medium transition-colors select-none',
                    isActive ? 'text-[#2832A4]' : 'text-slate-400'
                  )}
                >
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </button>
            ) : isRejected ? (
              <Badge status="Rejected" className="gap-1.5 text-xs font-semibold px-2.5 py-0.5 shadow-2xs select-none">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Rejected
              </Badge>
            ) : (
              <span className="text-xl font-semibold text-slate-400 select-none">—</span>
            )}
          </div>
        </div>

        {/* Contact Info Box: Tap to call, tap to email */}
        <div className="grid grid-cols-1 gap-1.5 rounded-xl bg-slate-50/80 p-2.5 text-xs text-slate-600 border border-slate-100">
          {member.mobile && (
            <a
              href={`tel:${member.mobile}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 hover:text-[#2832A4] transition truncate"
            >
              <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              <span className="truncate">{member.mobile}</span>
            </a>
          )}
          {member.email && (
            <a
              href={`mailto:${member.email}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 hover:text-[#2832A4] transition truncate"
            >
              <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              <span className="truncate">{member.email}</span>
            </a>
          )}
          {(member.city || member.country) && (
            <div className="flex items-center gap-2 text-slate-500 truncate">
              <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              <span className="truncate">
                {member.city
                  ? member.country && member.country !== member.city
                    ? `${member.city}, ${member.country}`
                    : member.city
                  : member.country}
              </span>
            </div>
          )}
        </div>

        {/* Mobile Action Buttons Toolbar */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Actions
          </span>
          <div className="flex items-center gap-1.5">
            {/* View Details */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onView) onView(member);
              }}
              title="View Details"
              aria-label="View Details"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2832A4] bg-white text-[#2832A4] transition-all hover:bg-blue-50 active:scale-95 shadow-2xs cursor-pointer"
            >
              <Eye className="h-4 w-4" />
            </button>

            {/* When Approved: ID Card, Edit, Delete */}
            {isApproved && (
              <>
                {onIdCard && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onIdCard(member);
                    }}
                    title="View ID Card"
                    aria-label="View ID Card"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-indigo-200 bg-indigo-50/70 text-[#1E2B8F] transition-all hover:bg-indigo-100 active:scale-95 shadow-2xs cursor-pointer"
                  >
                    <CreditCard className="h-4 w-4" />
                  </button>
                )}

                {onEdit && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(member);
                    }}
                    title="Edit Member"
                    aria-label="Edit Member"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition-all hover:border-brand-500 hover:text-brand-600 hover:bg-slate-50 active:scale-95 shadow-2xs cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}

                {onDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(member);
                    }}
                    title="Delete Member"
                    aria-label="Delete Member"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-50/70 text-red-600 transition-all hover:bg-red-100 hover:border-red-300 active:scale-95 shadow-2xs cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </>
            )}

            {/* When Pending: Approve & Reject ONLY */}
            {isPending && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onApprove(member);
                  }}
                  title="Approve Member"
                  aria-label="Approve Member"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-400 bg-white text-emerald-600 transition-all hover:bg-emerald-50 active:scale-95 shadow-2xs cursor-pointer"
                >
                  <Check className="h-4 w-4 stroke-[2.5]" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject(member);
                  }}
                  title="Reject Member"
                  aria-label="Reject Member"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-red-400 bg-white text-red-500 transition-all hover:bg-red-50 active:scale-95 shadow-2xs cursor-pointer"
                >
                  <X className="h-4 w-4 stroke-[2.5]" />
                </button>
              </>
            )}

            {/* When Rejected: Delete */}
            {!isApproved && !isPending && onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(member);
                }}
                title="Delete Member"
                aria-label="Delete Member"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-50/70 text-red-600 transition-all hover:bg-red-100 hover:border-red-300 active:scale-95 shadow-2xs cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TABLET & DESKTOP TABLE ROW (>= md: 12-column structured grid)          */}
      {/* ========================================================================= */}
      <div className="hidden md:grid grid-cols-12 gap-4 items-center px-6 py-4">
        {/* 1. Member Column (4 cols) */}
        <div className="col-span-4 flex items-center gap-3.5 min-w-0">
          <Avatar
            name={member.name}
            src={member.avatar}
            size="lg"
            className="shrink-0 shadow-sm"
          />
          <div className="min-w-0">
            <p className="text-sm font-bold text-ink truncate">{member.name}</p>
            <p className="mt-0.5 text-xs text-slate-500 truncate">{member.business || 'Business Member'}</p>
            {member.membershipId && (
              <span className="inline-block text-[11px] font-mono text-slate-400">
                {member.membershipId}
              </span>
            )}
          </div>
        </div>

        {/* 2. Contact Info Column (3 cols) */}
        <div className="col-span-3 min-w-0">
          <ul className="space-y-1 text-xs text-slate-500">
            {member.mobile && (
              <li className="flex items-center gap-2 truncate">
                <a
                  href={`tel:${member.mobile}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 hover:text-[#2832A4] transition truncate"
                >
                  <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                  <span className="truncate">{member.mobile}</span>
                </a>
              </li>
            )}
            {member.email && (
              <li className="flex items-center gap-2 truncate">
                <a
                  href={`mailto:${member.email}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 hover:text-[#2832A4] transition truncate"
                >
                  <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                  <span className="truncate">{member.email}</span>
                </a>
              </li>
            )}
            {(member.city || member.country) && (
              <li className="flex items-center gap-2 truncate">
                <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                <span className="truncate">
                  {member.city
                    ? member.country && member.country !== member.city
                      ? `${member.city}, ${member.country}`
                      : member.city
                    : member.country}
                </span>
              </li>
            )}
          </ul>
        </div>

        {/* 3. Status Column (2 cols) */}
        <div className="col-span-2 flex items-center justify-center">
          {isApproved ? (
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleActive) onToggleActive(member, !isActive);
              }}
              title={isActive ? 'Status: Active (Click to make Inactive)' : 'Status: Inactive (Click to make Active)'}
              className="inline-flex items-center gap-2.5 cursor-pointer focus:outline-none select-none transition-opacity active:opacity-80"
            >
              <span
                aria-hidden="true"
                className={cn(
                  'relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
                  isActive ? 'bg-[#2832A4]' : 'bg-slate-300'
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
                    isActive ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </span>
              <span
                className={cn(
                  'text-sm font-medium transition-colors select-none',
                  isActive ? 'text-[#2832A4]' : 'text-slate-400'
                )}
              >
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </button>
          ) : isRejected ? (
            <Badge status="Rejected" className="gap-1.5 text-xs font-semibold px-3 py-1 shadow-2xs select-none">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              Rejected
            </Badge>
          ) : (
            <span className="text-xl font-semibold text-slate-400 select-none">—</span>
          )}
        </div>

        {/* 4. Actions Column (3 cols - fits all 5 buttons on one single row) */}
        <div className="col-span-3 flex items-center justify-end gap-1.5 lg:gap-2">
          {/* View Details Icon Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onView) onView(member);
            }}
            title="View Details"
            aria-label="View Details"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2832A4] bg-white text-[#2832A4] transition-all hover:bg-blue-50 hover:shadow-xs active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
          >
            <Eye className="h-4 w-4" />
          </button>

          {/* When Approved: ID Card, Edit, Delete */}
          {isApproved && (
            <>
              {onIdCard && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onIdCard(member);
                  }}
                  title="View ID Card"
                  aria-label="View ID Card"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-indigo-200 bg-indigo-50/60 text-[#1E2B8F] transition-all hover:bg-indigo-100 hover:shadow-xs active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                >
                  <CreditCard className="h-4 w-4" />
                </button>
              )}

              {onEdit && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(member);
                  }}
                  title="Edit Member"
                  aria-label="Edit Member"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700 transition-all hover:border-brand-500 hover:text-brand-600 hover:bg-slate-50 hover:shadow-xs active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-100 cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}

              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(member);
                  }}
                  title="Delete Member"
                  aria-label="Delete Member"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-50/60 text-red-600 transition-all hover:bg-red-100 hover:border-red-300 hover:shadow-xs active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-100 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </>
          )}

          {/* When Pending: Approve & Reject ONLY */}
          {isPending && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onApprove(member);
                }}
                title="Approve Member"
                aria-label="Approve Member"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-400 bg-white text-emerald-600 transition-all hover:bg-emerald-50 hover:shadow-xs active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-100 cursor-pointer"
              >
                <Check className="h-4 w-4 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onReject(member);
                }}
                title="Reject Member"
                aria-label="Reject Member"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-red-400 bg-white text-red-500 transition-all hover:bg-red-50 hover:shadow-xs active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-100 cursor-pointer"
              >
                <X className="h-4 w-4 stroke-[2.5]" />
              </button>
            </>
          )}

          {/* When Rejected: Delete */}
          {!isApproved && !isPending && onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(member);
              }}
              title="Delete Member"
              aria-label="Delete Member"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-red-200 bg-red-50/60 text-red-600 transition-all hover:bg-red-100 hover:border-red-300 hover:shadow-xs active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-100 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

export default memo(MemberRowComponent);
