'use client';

import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Building2,
  Briefcase,
  MapPin,
  Calendar,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
  Shield,
} from 'lucide-react';
import Avatar from '@/components/common/Avatar';

// Formats ISO date to readable string, e.g. "23 Oct 2026, 12:41 pm"
function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const dateFormatted = d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    const timeFormatted = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `${dateFormatted}, ${timeFormatted}`;
  } catch {
    return dateStr;
  }
}

// Formats mobile with +91 if needed
function formatMobile(num) {
  if (!num || num === '-') return '-';
  const clean = String(num).trim();
  if (clean.startsWith('+')) return clean;
  return `+91 ${clean}`;
}

export default function ViewLeadView({ lead, onBack }) {
  if (!lead) return null;

  const member = lead.member || {};
  const status = (lead.status || 'ACTIVE').toUpperCase();
  const isActive = status === 'ACTIVE';

  return (
    <div className="space-y-6">
      {/* MAIN CONTAINER */}
      <section className="rounded-3xl border border-white bg-white p-6 md:p-10 shadow-card space-y-8">
        {/* TOP HEADER ROW: Title + Back Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#1B1F3B] tracking-tight">
              Lead Details
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Complete read-only overview of member inquiry and lead requirements.
            </p>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-full border border-[#2832A4] bg-white px-5 py-2 text-xs md:text-sm font-semibold text-[#2832A4] hover:bg-blue-50 transition shadow-xs self-start sm:self-auto cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Leads</span>
          </button>
        </div>

        {/* PROFILE BANNER CARD */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-2xl bg-gradient-to-r from-[#F4F6FF] to-[#FAF8FF] border border-[#E5E9FF] p-5 md:p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 md:h-18 md:w-18 shrink-0 overflow-hidden rounded-full border-2 border-white shadow-sm">
              <Avatar
                name={member.name || lead.title}
                src={member.avatar}
                size="lg"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-lg md:text-xl font-bold text-[#1B1F3B] tracking-tight">
                  {member.name || lead.title || 'Member'}
                </h3>
                {member.membershipId && (
                  <span className="inline-block rounded-md bg-white px-2.5 py-0.5 text-xs font-mono font-bold text-[#2832A4] border border-blue-200 shadow-2xs">
                    {member.membershipId}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-slate-500 mt-0.5">
                {member.business && member.business !== '-'
                  ? member.business
                  : 'Jewellery Business'}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2 sm:self-center">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider ${
                isActive
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  isActive ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
              />
              {status}
            </span>
          </div>
        </div>

        {/* SECTION 1: Lead Requirement Details */}
        <div className="space-y-4">
          <h3 className="text-sm md:text-base font-bold text-[#2832A4] tracking-wide flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Lead Requirement Details</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Requirement / Title */}
            <div className="md:col-span-2 rounded-2xl border border-slate-100 bg-[#F8FAFC] p-4 transition-all">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Lead Title / Requirement
              </span>
              <span className="mt-1 block text-sm md:text-base font-semibold text-[#1E293B]">
                {lead.title || '-'}
              </span>
            </div>

            {/* Source */}
            <div className="rounded-2xl border border-slate-100 bg-[#F8FAFC] p-4 transition-all">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Source
              </span>
              <span className="mt-1 block text-sm md:text-[15px] font-semibold text-[#1E293B]">
                {lead.source || 'WhatsApp'}
              </span>
            </div>

            {/* Status */}
            <div className="rounded-2xl border border-slate-100 bg-[#F8FAFC] p-4 transition-all">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Status
              </span>
              <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {status}
              </span>
            </div>

            {/* Added On */}
            <div className="rounded-2xl border border-slate-100 bg-[#F8FAFC] p-4 transition-all">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Added On
              </span>
              <span className="mt-1 block text-sm md:text-[15px] font-semibold text-[#1E293B]">
                {formatDateTime(lead.createdAt)}
              </span>
            </div>

            {/* Last Updated */}
            <div className="rounded-2xl border border-slate-100 bg-[#F8FAFC] p-4 transition-all">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Last Updated
              </span>
              <span className="mt-1 block text-sm md:text-[15px] font-semibold text-[#1E293B]">
                {formatDateTime(lead.updatedAt)}
              </span>
            </div>

            {/* Description (Full Width) */}
            <div className="md:col-span-2 rounded-2xl border border-slate-100 bg-[#F8FAFC] p-5 transition-all">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Description
              </span>
              <p className="text-sm md:text-[15px] font-medium text-slate-700 leading-relaxed whitespace-pre-line">
                {lead.description || 'No additional description provided.'}
              </p>
            </div>

            {/* Attachment Image (if present) */}
            {lead.image && (
              <div className="md:col-span-2 rounded-2xl border border-slate-100 bg-[#F8FAFC] p-5 transition-all">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Attachment Image
                </span>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="relative h-28 w-28 md:h-32 md:w-32 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs shrink-0">
                    <img
                      src={lead.image}
                      alt={lead.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold text-[#1E293B]">
                      Lead Attachment / Graphic
                    </p>
                    <p className="text-xs text-slate-500">
                      Uploaded media for this requirement.
                    </p>
                    <a
                      href={lead.image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2832A4] hover:underline pt-1"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>View Full Resolution Image</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: Member / Basic Information */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          <h3 className="text-sm md:text-base font-bold text-[#2832A4] tracking-wide flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Basic Information</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Lead Name */}
            <div className="rounded-2xl border border-slate-100 bg-[#F8FAFC] p-4 transition-all">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Lead Name
              </span>
              <span className="mt-1 block text-sm md:text-[15px] font-semibold text-[#1E293B]">
                {member.name || lead.title || '-'}
              </span>
            </div>

            {/* Mobile Number */}
            <div className="rounded-2xl border border-slate-100 bg-[#F8FAFC] p-4 transition-all">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Mobile Number
              </span>
              <span className="mt-1 block text-sm md:text-[15px] font-semibold text-[#1E293B]">
                {formatMobile(member.mobile)}
              </span>
            </div>

            {/* Email Address */}
            <div className="rounded-2xl border border-slate-100 bg-[#F8FAFC] p-4 transition-all">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Email Address
              </span>
              <span className="mt-1 block text-sm md:text-[15px] font-semibold text-[#1E293B] break-all">
                {member.email && member.email !== '-' ? member.email : '-'}
              </span>
            </div>

            {/* Business Name */}
            <div className="rounded-2xl border border-slate-100 bg-[#F8FAFC] p-4 transition-all">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Business Name
              </span>
              <span className="mt-1 block text-sm md:text-[15px] font-semibold text-[#1E293B]">
                {member.business && member.business !== '-' ? member.business : '-'}
              </span>
            </div>

            {/* Business Type */}
            <div className="rounded-2xl border border-slate-100 bg-[#F8FAFC] p-4 transition-all">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Business Type
              </span>
              <span className="mt-1 block text-sm md:text-[15px] font-semibold text-[#1E293B]">
                {member.businessType || 'Retailer / B2C'}
              </span>
            </div>

            {/* City */}
            <div className="rounded-2xl border border-slate-100 bg-[#F8FAFC] p-4 transition-all">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                City
              </span>
              <span className="mt-1 block text-sm md:text-[15px] font-semibold text-[#1E293B]">
                {member.city && member.city !== '-' ? member.city : 'Ahmedabad'}
              </span>
            </div>

            {/* Address (Full Width) */}
            <div className="md:col-span-2 rounded-2xl border border-slate-100 bg-[#F8FAFC] p-4 transition-all">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Address
              </span>
              <span className="mt-1 block text-sm md:text-[15px] font-semibold text-[#1E293B] leading-relaxed">
                {member.address && member.address !== '-' ? member.address : '-'}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
