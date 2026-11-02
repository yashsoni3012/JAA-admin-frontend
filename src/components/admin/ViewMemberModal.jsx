'use client';

import { useState, useEffect } from 'react';
import {
  Phone,
  Mail,
  Building2,
  Edit3,
  CreditCard,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import Modal from '@/components/common/Modal';
import Avatar from '@/components/common/Avatar';
import Button from '@/components/common/Button';
import { getMemberById } from '@/services/admin.service';
import { cn } from '@/lib/utils';

export default function ViewMemberModal({
  open,
  member,
  onClose,
  onEdit,
  onViewIdCard,
}) {
  const [activeMember, setActiveMember] = useState(member);

  useEffect(() => {
    setActiveMember(member);

    if (open && member?.id) {
      let isMounted = true;
      getMemberById(member.id).then((fresh) => {
        if (isMounted && fresh) {
          setActiveMember(fresh);
        }
      });
      return () => {
        isMounted = false;
      };
    }
  }, [open, member]);

  if (!member) return null;

  const current = activeMember || member;
  const rawStatus = (current.status || '').toLowerCase();
  const isRejected = rawStatus === 'rejected';
  const isApproved = rawStatus === 'approved';
  const isPending = !isRejected && !isApproved;

  // Format mobile with +91 if missing
  const formattedMobile = current.mobile
    ? current.mobile.startsWith('+')
      ? current.mobile
      : `+91 ${current.mobile}`
    : '-';

  return (
    <Modal
      open={open}
      title="Member Details"
      onClose={onClose}
      maxWidth="max-w-3xl lg:max-w-4xl"
      headerBorder={false}
      headerClassName="px-4 pt-4 pb-2 sm:px-6 sm:pt-6 md:px-8 md:pt-7 md:pb-2 no-print"
      bodyClassName="px-4 py-2 sm:px-6 md:px-8 md:py-4"
    >
      <div className="space-y-6 pb-4 sm:pb-6">
        {/* TOP PROFILE HEADER SECTION */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          {/* Avatar & Identity */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-full border-2 border-slate-100 shrink-0 shadow-md">
              <Avatar
                name={current.name}
                src={current.avatar}
                size="lg"
                className="h-full w-full text-xl sm:text-2xl font-bold object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg sm:text-2xl font-bold text-ink tracking-tight">
                {current.name}
              </h3>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
                {current.business || 'Business Member'}
              </p>

              {/* Status Badges */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                {isApproved && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Approved
                  </span>
                )}
                {isPending && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1 text-xs font-semibold text-amber-600">
                    <Clock className="h-3.5 w-3.5" />
                    Pending Approval
                  </span>
                )}
                {isRejected && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-red-300 bg-red-50 px-3.5 py-1 text-xs font-semibold text-red-600">
                    <XCircle className="h-3.5 w-3.5" />
                    Rejected
                  </span>
                )}
                {current.membershipId && (
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-mono font-bold text-slate-700">
                    {current.membershipId}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Contact Right Column */}
          <div className="space-y-2 text-xs sm:text-sm text-slate-600 sm:text-right shrink-0">
            {current.mobile && (
              <div className="flex items-center sm:justify-end gap-2.5">
                <Phone className="h-4 w-4 text-[#2832A4] shrink-0" strokeWidth={1.8} />
                <a
                  href={`tel:${current.mobile}`}
                  className="font-semibold text-slate-800 hover:text-[#2832A4] transition"
                >
                  {current.mobile}
                </a>
              </div>
            )}
            {current.email && (
              <div className="flex items-center sm:justify-end gap-2.5">
                <Mail className="h-4 w-4 text-[#2832A4] shrink-0" strokeWidth={1.8} />
                <a
                  href={`mailto:${current.email}`}
                  className="font-medium text-slate-700 hover:text-[#2832A4] transition"
                >
                  {current.email}
                </a>
              </div>
            )}
            {(current.city || current.country) && (
              <div className="flex items-center sm:justify-end gap-2.5">
                <Building2 className="h-4 w-4 text-[#2832A4] shrink-0" strokeWidth={1.8} />
                <span className="font-medium text-slate-700">
                  {current.city
                    ? `${current.city}, ${current.country || 'India'}`
                    : current.country || 'India'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Rejection Reason box if rejected */}
        {isRejected && (
          <div className="rounded-2xl border border-red-200 bg-red-50/80 px-5 py-3.5 text-xs sm:text-sm">
            <span className="font-bold text-red-600">Rejection Reason: </span>
            <span className="text-red-700 font-medium">
              {current.rejectionReason || 'No specific rejection reason provided.'}
            </span>
          </div>
        )}

        {/* TWO-COLUMN DETAILS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-12 pt-1">
          {/* Left Column: Personal Information */}
          <div className="space-y-4 sm:space-y-5">
            <h4 className="text-sm sm:text-base font-bold text-[#2832A4] tracking-wide border-b border-slate-100 pb-2">
              Personal Information
            </h4>
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] md:grid-cols-[150px_1fr] gap-x-3 gap-y-0.5 sm:gap-y-0 items-baseline">
                <span className="text-xs sm:text-sm font-bold text-ink">Full Name</span>
                <span className="text-xs sm:text-sm font-medium text-slate-700">
                  {current.name || '-'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] md:grid-cols-[150px_1fr] gap-x-3 gap-y-0.5 sm:gap-y-0 items-baseline">
                <span className="text-xs sm:text-sm font-bold text-ink">Email Address</span>
                <span className="text-xs sm:text-sm font-medium text-slate-700 break-all">
                  {current.email || '-'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] md:grid-cols-[150px_1fr] gap-x-3 gap-y-0.5 sm:gap-y-0 items-baseline">
                <span className="text-xs sm:text-sm font-bold text-ink">Mobile Number</span>
                <span className="text-xs sm:text-sm font-medium text-slate-700">
                  {formattedMobile}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] md:grid-cols-[150px_1fr] gap-x-3 gap-y-0.5 sm:gap-y-0 items-baseline">
                <span className="text-xs sm:text-sm font-bold text-ink">Date of Birth</span>
                <span className="text-xs sm:text-sm font-medium text-slate-700">
                  {current.dob || '31 July 2000'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] md:grid-cols-[150px_1fr] gap-x-3 gap-y-0.5 sm:gap-y-0 items-start">
                <span className="text-xs sm:text-sm font-bold text-ink">Address</span>
                <span className="text-xs sm:text-sm font-medium text-slate-700 leading-relaxed">
                  {current.address || current.city || '-'}
                </span>
              </div>

              {current.city && (
                <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] md:grid-cols-[150px_1fr] gap-x-3 gap-y-0.5 sm:gap-y-0 items-baseline">
                  <span className="text-xs sm:text-sm font-bold text-ink">City</span>
                  <span className="text-xs sm:text-sm font-medium text-slate-700">
                    {current.city}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Business Details */}
          <div className="space-y-4 sm:space-y-5">
            <h4 className="text-sm sm:text-base font-bold text-[#2832A4] tracking-wide border-b border-slate-100 pb-2">
              Business Details
            </h4>
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] md:grid-cols-[150px_1fr] gap-x-3 gap-y-0.5 sm:gap-y-0 items-baseline">
                <span className="text-xs sm:text-sm font-bold text-ink">Business Name</span>
                <span className="text-xs sm:text-sm font-medium text-slate-700">
                  {current.business || '-'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] md:grid-cols-[150px_1fr] gap-x-3 gap-y-0.5 sm:gap-y-0 items-baseline">
                <span className="text-xs sm:text-sm font-bold text-ink">Business Type</span>
                <span className="text-xs sm:text-sm font-medium text-slate-700">
                  {current.businessType || 'Retailer'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] md:grid-cols-[150px_1fr] gap-x-3 gap-y-0.5 sm:gap-y-0 items-baseline">
                <span className="text-xs sm:text-sm font-bold text-ink">Membership ID</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 font-mono inline-block bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200 w-fit">
                  {current.membershipId || `JAA-MEM-${current.id}`}
                </span>
              </div>

              {current.joinedOn && (
                <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] md:grid-cols-[150px_1fr] gap-x-3 gap-y-0.5 sm:gap-y-0 items-baseline">
                  <span className="text-xs sm:text-sm font-bold text-ink">Member Since</span>
                  <span className="text-xs sm:text-sm font-medium text-slate-700">
                    {current.joinedOn}
                  </span>
                </div>
              )}

              {current.createdAt && current.createdAt !== current.joinedOn && (
                <div className="grid grid-cols-1 sm:grid-cols-[130px_1fr] md:grid-cols-[150px_1fr] gap-x-3 gap-y-0.5 sm:gap-y-0 items-baseline">
                  <span className="text-xs sm:text-sm font-bold text-ink">Registered At</span>
                  <span className="text-xs sm:text-sm font-medium text-slate-700">
                    {current.createdAt}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM ACTIONS */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-between gap-2.5 sm:gap-3 pt-5 border-t border-slate-100 no-print">
          {/* Left: View ID Card button if member is approved */}
          <div>
            {isApproved && onViewIdCard && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onClose();
                  onViewIdCard(current);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border-indigo-200 bg-indigo-50/70 text-[#1E2B8F] hover:bg-indigo-100 px-5 py-2.5 text-xs sm:text-sm font-semibold transition"
              >
                <CreditCard className="h-4 w-4" />
                <span>View ID Card</span>
              </Button>
            )}
          </div>

          {/* Right: Close and Edit buttons */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:flex-initial rounded-full px-6 py-2.5 text-xs sm:text-sm font-semibold justify-center"
            >
              Close
            </Button>

            {onEdit && (
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  onClose();
                  onEdit(current);
                }}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-xs sm:text-sm font-semibold shadow-md shadow-brand-500/20"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit Member</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
