'use client';

import { Phone, Mail, Building2, Edit3, X } from 'lucide-react';
import Modal from '@/components/common/Modal';
import Avatar from '@/components/common/Avatar';
import Button from '@/components/common/Button';
import { cn } from '@/lib/utils';

export default function ViewMemberModal({ open, member, onClose, onEdit }) {
  if (!member) return null;

  const rawStatus = (member.status || '').toLowerCase();
  const isRejected = rawStatus === 'rejected';
  const isApproved = rawStatus === 'approved';
  const isPending = !isRejected && !isApproved;

  // Format mobile with +91 if missing
  const formattedMobile = member.mobile
    ? member.mobile.startsWith('+')
      ? member.mobile
      : `+91 ${member.mobile}`
    : '-';

  return (
    <Modal
      open={open}
      title="View Member Details"
      onClose={onClose}
      maxWidth="max-w-4xl lg:max-w-5xl"
      headerBorder={false}
      headerClassName="px-6 pt-6 pb-2 md:px-10 md:pt-8 md:pb-2"
      bodyClassName="px-6 py-2 md:px-10 md:py-4"
    >
      <div className="space-y-7 pb-8">
        {/* TOP PROFILE HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          {/* Avatar & Identity */}
          <div className="flex items-center gap-5">
            <div className="h-18 w-18 md:h-20 md:w-20 overflow-hidden rounded-full border-2 border-slate-100 shrink-0 shadow-md">
              <Avatar
                name={member.name}
                src={member.avatar}
                size="lg"
                className="h-full w-full text-2xl font-bold object-cover"
              />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-ink tracking-tight">
                {member.name}
              </h3>
              <p className="text-sm md:text-base font-medium text-slate-500 mt-0.5">
                {member.business || 'Business Member'}
              </p>

              {/* Status Badges with decent bordered background */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                {isRejected && (
                  <span className="inline-flex items-center rounded-full border border-red-300 bg-red-50 px-3.5 py-1 text-xs font-semibold text-red-500">
                    Rejected
                  </span>
                )}
                {isApproved && (
                  <span className="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-500">
                    Approved
                  </span>
                )}
                {isPending && (
                  <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1 text-xs font-semibold text-amber-500">
                    Pending
                  </span>
                )}
                {member.membershipId && (
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 font-mono">
                    {member.membershipId}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Contact Right Column */}
          <div className="space-y-2 text-sm text-slate-600 sm:text-right shrink-0">
            <div className="flex items-center sm:justify-end gap-2.5">
              <Phone className="h-4 w-4 text-[#3F4BC4] shrink-0" strokeWidth={1.8} />
              <span className="font-semibold text-slate-800">{member.mobile}</span>
            </div>
            <div className="flex items-center sm:justify-end gap-2.5">
              <Mail className="h-4 w-4 text-[#3F4BC4] shrink-0" strokeWidth={1.8} />
              <span className="font-medium text-slate-700">{member.email}</span>
            </div>
            <div className="flex items-center sm:justify-end gap-2.5">
              <Building2 className="h-4 w-4 text-[#3F4BC4] shrink-0" strokeWidth={1.8} />
              <span className="font-medium text-slate-700">
                {member.city ? `${member.city}, ${member.country || 'India'}` : member.country || 'India'}
              </span>
            </div>
          </div>
        </div>

        {/* DECENT RED BORDERED REJECTION REASON BOX */}
        {isRejected && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-3.5 text-sm">
            <span className="font-semibold text-red-600">Rejection Reason: </span>
            <span className="text-red-700 font-medium">
              {member.rejectionReason || 'No specific rejection reason provided.'}
            </span>
          </div>
        )}

        {/* TWO-COLUMN DETAILS SECTION (Spacious, Clean CSS Grid Alignment) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 pt-1">
          {/* Left Column: Personal Information */}
          <div className="space-y-5">
            <h4 className="text-base font-bold text-[#3F4BC4] tracking-wide border-b border-slate-100 pb-2">
              Personal Information
            </h4>
            <div className="space-y-4">
              <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[170px_1fr] gap-x-4 items-baseline">
                <span className="text-sm font-bold text-ink">Full Name</span>
                <span className="text-sm font-medium text-slate-700">{member.name || '-'}</span>
              </div>

              <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[170px_1fr] gap-x-4 items-baseline">
                <span className="text-sm font-bold text-ink">Email Address</span>
                <span className="text-sm font-medium text-slate-700 break-all">{member.email || '-'}</span>
              </div>

              <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[170px_1fr] gap-x-4 items-baseline">
                <span className="text-sm font-bold text-ink">Mobile Number</span>
                <span className="text-sm font-medium text-slate-700">{formattedMobile}</span>
              </div>

              <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[170px_1fr] gap-x-4 items-baseline">
                <span className="text-sm font-bold text-ink">Date of Birth</span>
                <span className="text-sm font-medium text-slate-700">{member.dob || '31 July 2000'}</span>
              </div>

              <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[170px_1fr] gap-x-4 items-start">
                <span className="text-sm font-bold text-ink">Address</span>
                <span className="text-sm font-medium text-slate-700 leading-relaxed">
                  {member.address || member.city || '-'}
                </span>
              </div>

              {member.city && (
                <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[170px_1fr] gap-x-4 items-baseline">
                  <span className="text-sm font-bold text-ink">City</span>
                  <span className="text-sm font-medium text-slate-700">{member.city}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Business Details */}
          <div className="space-y-5">
            <h4 className="text-base font-bold text-[#3F4BC4] tracking-wide border-b border-slate-100 pb-2">
              Business Details
            </h4>
            <div className="space-y-4">
              <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[170px_1fr] gap-x-4 items-baseline">
                <span className="text-sm font-bold text-ink">Business Name</span>
                <span className="text-sm font-medium text-slate-700">{member.business || '-'}</span>
              </div>

              <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[170px_1fr] gap-x-4 items-baseline">
                <span className="text-sm font-bold text-ink">Business Type</span>
                <span className="text-sm font-medium text-slate-700">
                  {member.businessType || 'Retailer'}
                </span>
              </div>

              <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[170px_1fr] gap-x-4 items-baseline">
                <span className="text-sm font-bold text-ink">Membership ID</span>
                <span className="text-sm font-bold text-slate-800 font-mono inline-block bg-slate-100 px-3 py-1 rounded-md border border-slate-200 w-fit">
                  {member.membershipId || `JAA-MEM-${member.id}`}
                </span>
              </div>

              {member.joinedOn && (
                <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[170px_1fr] gap-x-4 items-baseline">
                  <span className="text-sm font-bold text-ink">Member Since</span>
                  <span className="text-sm font-medium text-slate-700">{member.joinedOn}</span>
                </div>
              )}

              {member.createdAt && member.createdAt !== member.joinedOn && (
                <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[170px_1fr] gap-x-4 items-baseline">
                  <span className="text-sm font-bold text-ink">Registered At</span>
                  <span className="text-sm font-medium text-slate-700">{member.createdAt}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-full px-6 py-2.5 text-sm font-semibold"
          >
            Close
          </Button>
          {onEdit && (
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                onClose();
                onEdit(member);
              }}
              className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold shadow-md shadow-brand-500/20"
            >
              <Edit3 className="h-4 w-4" />
              <span>Edit Member</span>
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
