'use client';

import { useState, useEffect } from 'react';
import { Phone, Mail, Building2, Edit3, CreditCard, User, X } from 'lucide-react';
import Modal from '@/components/common/Modal';
import Avatar from '@/components/common/Avatar';
import Button from '@/components/common/Button';
import MemberIdCard from '@/components/members/MemberIdCard';
import { getMemberById } from '@/services/admin.service';
import { cn } from '@/lib/utils';

export default function ViewMemberModal({ open, member, onClose, onEdit }) {
  const [activeTab, setActiveTab] = useState('id-card'); // 'id-card' | 'details'
  const [activeMember, setActiveMember] = useState(member);

  useEffect(() => {
    setActiveMember(member);
    setActiveTab('id-card'); // default to ID Card when opening modal

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
      headerClassName="px-6 pt-6 pb-2 md:px-8 md:pt-7 md:pb-2 no-print"
      bodyClassName="px-6 py-2 md:px-8 md:py-4"
    >
      <div className="space-y-6 pb-6">
        {/* TAB NAVIGATION: "Member ID Card" vs "Profile Details" */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 no-print">
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-full">
            <button
              type="button"
              onClick={() => setActiveTab('id-card')}
              className={cn(
                'flex items-center gap-2 px-5 py-2 rounded-full text-xs md:text-sm font-bold transition-all',
                activeTab === 'id-card'
                  ? 'bg-white text-[#2832A4] shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              )}
            >
              <CreditCard className="h-4 w-4" />
              <span>Digital ID Card</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={cn(
                'flex items-center gap-2 px-5 py-2 rounded-full text-xs md:text-sm font-bold transition-all',
                activeTab === 'details'
                  ? 'bg-white text-[#2832A4] shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              )}
            >
              <User className="h-4 w-4" />
              <span>Personal & Business Info</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Membership ID:</span>
            <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              {current.idCard?.cardNumber || current.membershipId}
            </span>
          </div>
        </div>

        {/* TAB 1: DIGITAL MEMBER ID CARD */}
        {activeTab === 'id-card' && (
          <div className="animate-in fade-in duration-200">
            <MemberIdCard member={current} />
          </div>
        )}

        {/* TAB 2: DETAILED PERSONAL & BUSINESS BREAKDOWN */}
        {activeTab === 'details' && (
          <div className="space-y-7 animate-in fade-in duration-200">
            {/* TOP PROFILE HEADER SECTION */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
              {/* Avatar & Identity */}
              <div className="flex items-center gap-5">
                <div className="h-18 w-18 md:h-20 md:w-20 overflow-hidden rounded-full border-2 border-slate-100 shrink-0 shadow-md">
                  <Avatar
                    name={current.name}
                    src={current.avatar}
                    size="lg"
                    className="h-full w-full text-2xl font-bold object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-ink tracking-tight">
                    {current.name}
                  </h3>
                  <p className="text-sm md:text-base font-medium text-slate-500 mt-0.5">
                    {current.business || 'Business Member'}
                  </p>

                  {/* Status Badges */}
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
                    {current.membershipId && (
                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 font-mono">
                        {current.membershipId}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Contact Right Column */}
              <div className="space-y-2 text-sm text-slate-600 sm:text-right shrink-0">
                <div className="flex items-center sm:justify-end gap-2.5">
                  <Phone className="h-4 w-4 text-[#3F4BC4] shrink-0" strokeWidth={1.8} />
                  <span className="font-semibold text-slate-800">{current.mobile}</span>
                </div>
                <div className="flex items-center sm:justify-end gap-2.5">
                  <Mail className="h-4 w-4 text-[#3F4BC4] shrink-0" strokeWidth={1.8} />
                  <span className="font-medium text-slate-700">{current.email}</span>
                </div>
                <div className="flex items-center sm:justify-end gap-2.5">
                  <Building2 className="h-4 w-4 text-[#3F4BC4] shrink-0" strokeWidth={1.8} />
                  <span className="font-medium text-slate-700">
                    {current.city ? `${current.city}, ${current.country || 'India'}` : current.country || 'India'}
                  </span>
                </div>
              </div>
            </div>

            {/* Rejection Reason box if rejected */}
            {isRejected && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-3.5 text-sm">
                <span className="font-semibold text-red-600">Rejection Reason: </span>
                <span className="text-red-700 font-medium">
                  {current.rejectionReason || 'No specific rejection reason provided.'}
                </span>
              </div>
            )}

            {/* Two-column personal & business info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 pt-1">
              {/* Left Column: Personal Information */}
              <div className="space-y-5">
                <h4 className="text-base font-bold text-[#3F4BC4] tracking-wide border-b border-slate-100 pb-2">
                  Personal Information
                </h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[170px_1fr] gap-x-4 items-baseline">
                    <span className="text-sm font-bold text-ink">Full Name</span>
                    <span className="text-sm font-medium text-slate-700">{current.name || '-'}</span>
                  </div>

                  <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[170px_1fr] gap-x-4 items-baseline">
                    <span className="text-sm font-bold text-ink">Email Address</span>
                    <span className="text-sm font-medium text-slate-700 break-all">{current.email || '-'}</span>
                  </div>

                  <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[170px_1fr] gap-x-4 items-baseline">
                    <span className="text-sm font-bold text-ink">Mobile Number</span>
                    <span className="text-sm font-medium text-slate-700">{formattedMobile}</span>
                  </div>

                  <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[170px_1fr] gap-x-4 items-baseline">
                    <span className="text-sm font-bold text-ink">Date of Birth</span>
                    <span className="text-sm font-medium text-slate-700">{current.dob || '31 July 2000'}</span>
                  </div>

                  <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[170px_1fr] gap-x-4 items-start">
                    <span className="text-sm font-bold text-ink">Address</span>
                    <span className="text-sm font-medium text-slate-700 leading-relaxed">
                      {current.address || current.city || '-'}
                    </span>
                  </div>

                  {current.city && (
                    <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[170px_1fr] gap-x-4 items-baseline">
                      <span className="text-sm font-bold text-ink">City</span>
                      <span className="text-sm font-medium text-slate-700">{current.city}</span>
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
                    <span className="text-sm font-medium text-slate-700">{current.business || '-'}</span>
                  </div>

                  <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[170px_1fr] gap-x-4 items-baseline">
                    <span className="text-sm font-bold text-ink">Business Type</span>
                    <span className="text-sm font-medium text-slate-700">
                      {current.businessType || 'Retailer'}
                    </span>
                  </div>

                  <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[170px_1fr] gap-x-4 items-baseline">
                    <span className="text-sm font-bold text-ink">Membership ID</span>
                    <span className="text-sm font-bold text-slate-800 font-mono inline-block bg-slate-100 px-3 py-1 rounded-md border border-slate-200 w-fit">
                      {current.membershipId || `JAA-MEM-${current.id}`}
                    </span>
                  </div>

                  {current.joinedOn && (
                    <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[170px_1fr] gap-x-4 items-baseline">
                      <span className="text-sm font-bold text-ink">Member Since</span>
                      <span className="text-sm font-medium text-slate-700">{current.joinedOn}</span>
                    </div>
                  )}

                  {current.createdAt && current.createdAt !== current.joinedOn && (
                    <div className="grid grid-cols-[140px_1fr] sm:grid-cols-[170px_1fr] gap-x-4 items-baseline">
                      <span className="text-sm font-bold text-ink">Registered At</span>
                      <span className="text-sm font-medium text-slate-700">{current.createdAt}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM ACTIONS */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 no-print">
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
                onEdit(current);
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
