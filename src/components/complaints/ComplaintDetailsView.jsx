'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  Building,
  FileText,
  Paperclip,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  AlertCircle,
  FileSpreadsheet,
  Film,
  Image as ImageIcon,
  Check,
} from 'lucide-react';
import Avatar from '@/components/common/Avatar';
import Button from '@/components/common/Button';
import {
  formatComplaintCode,
  formatCurrency,
  getMediaUrl,
  updateComplaintStatus,
  isMemberEntity,
  isComplaintAgainstMember,
} from '@/services/complaint.service';
import { cn } from '@/lib/utils';

export default function ComplaintDetailsView({
  complaint,
  onBack,
  onStatusUpdated,
}) {
  const [currentStatus, setCurrentStatus] = useState(complaint?.status || 'Open');
  const [resolutionNotes, setResolutionNotes] = useState(
    complaint?.adminAction?.resolutionNotes || complaint?.resolutionNotes || ''
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [updateError, setUpdateError] = useState('');

  if (!complaint) return null;

  const complaintCode =
    complaint.complaintNumber ||
    formatComplaintCode(complaint.complaintId || complaint.id);

  // Check whether the target party is a verified Association Member or Outside Non-Member
  const isTargetAssociated = isComplaintAgainstMember(complaint);

  // Check whether the complainant party is an Association Member or Outside Non-Member
  const isComplainantAssociated = isMemberEntity(complaint.complaintBy);

  // Complainant resolution
  const complainant = complaint.complaintBy || {};
  const complainantMembershipId =
    complainant.membershipId && String(complainant.membershipId).trim() !== ''
      ? complainant.membershipId
      : complainant.memberId && Number(complainant.memberId) > 0
      ? `JAA-MEM-${complainant.memberId}`
      : null;

  const complainantAddress =
    complainant.address ||
    (complainant.city ? `${complainant.city}, Gujarat` : '') ||
    complaint.complaintDetails?.location ||
    'Ahmedabad, Gujarat';

  // Target resolution
  const target = complaint.targetMember || complaint.againstPerson || complaint.member || {};
  const targetMembershipId =
    isTargetAssociated && target.membershipId && String(target.membershipId).trim() !== ''
      ? target.membershipId
      : isTargetAssociated && target.memberId && Number(target.memberId) > 0
      ? `JAA-MEM-${target.memberId}`
      : null;

  const targetAddress =
    target.address ||
    (target.city ? `${target.city}, Gujarat` : '') ||
    complaint.complaintDetails?.location ||
    '-';

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateSuccess('');
    setUpdateError('');

    try {
      const idToUpdate = complaint.id || complaint.complaintId;
      const updated = await updateComplaintStatus(idToUpdate, {
        status: currentStatus,
        resolutionNotes,
      });
      setUpdateSuccess('Complaint status updated successfully!');
      if (onStatusUpdated) {
        onStatusUpdated({
          ...complaint,
          status: currentStatus,
          resolutionNotes,
          adminAction: {
            ...(complaint.adminAction || {}),
            resolutionNotes,
            updatedAt: 'Just now',
          },
          ...(updated || {}),
        });
      }
      setTimeout(() => setUpdateSuccess(''), 3500);
    } catch (err) {
      console.error('Failed to update status:', err);
      setUpdateError(err.message || 'Failed to update complaint status.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Helper for status badge styling matching Image 2
  const getStatusBadgeClass = (status) => {
    const s = String(status || '').toLowerCase();
    switch (s) {
      case 'resolved':
        return 'bg-[#F0FDF4] text-[#16A34A] border-[#86EFAC]';
      case 'in progress':
        return 'bg-[#EFF6FF] text-[#2563EB] border-[#93C5FD]';
      case 'under review':
        return 'bg-[#EEF2FF] text-[#4F46E5] border-[#C7D2FE]';
      case 'closed':
        return 'bg-[#FEF2F2] text-[#DC2626] border-[#FCA5A5]';
      case 'open':
      default:
        return 'bg-[#FFFBEB] text-[#D97706] border-[#FCD34D]';
    }
  };

  const getPriorityBadgeClass = (priority) => {
    const p = String(priority || '').toLowerCase();
    switch (p) {
      case 'high':
        return 'bg-[#FFF1F2] text-[#E11D48] border-[#FFE4E6]';
      case 'medium':
        return 'bg-[#FFFBEB] text-[#D97706] border-[#FEF3C7]';
      case 'low':
      default:
        return 'bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Card matching Image 2 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl border border-white bg-white p-6 md:p-8 shadow-card">
        {/* Title, Badges & Registered Date */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
              {complaintCode}
            </h2>

            {/* Target Status Badge: "Against Member" if verified associated member, else "Outside Non-Member" */}
            <span
              className={cn(
                'inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold border',
                isTargetAssociated
                  ? 'bg-[#EEF2FF] text-[#2832A4] border-[#D4DEFE]'
                  : 'bg-[#FFFBEB] text-[#D97706] border-[#FCD34D]'
              )}
            >
              {isTargetAssociated ? 'Against Member' : 'Outside Non-Member'}
            </span>

            {/* Priority Badge */}
            <span
              className={cn(
                'inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold border',
                getPriorityBadgeClass(complaint.complaintDetails?.priority || complaint.priority)
              )}
            >
              {complaint.complaintDetails?.priority || complaint.priority || 'Medium'} Priority
            </span>

            {/* Status Badge */}
            <span
              className={cn(
                'inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold border',
                getStatusBadgeClass(complaint.status)
              )}
            >
              {complaint.status === 'Open' ? 'Open / Pending' : complaint.status}
            </span>
          </div>

          <p className="text-xs sm:text-sm font-medium text-slate-400">
            Complaint Registered on:{' '}
            <span className="text-slate-600 font-semibold">{complaint.createdAt}</span>
          </p>
        </div>

        {/* Back to Complaints Button */}
        <button
          type="button"
          onClick={onBack}
          className="self-start md:self-auto inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition shadow-xs"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Complaints</span>
        </button>
      </div>

      {/* TWO SIDE-BY-SIDE CARDS: Complainant & Target matching Image 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CARD 1: COMPLAINT BY (COMPLAINANT) */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-7 shadow-card space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-[#2832A4]">
              COMPLAINT BY (COMPLAINANT)
            </span>
            <span
              className={cn(
                'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border',
                isComplainantAssociated
                  ? 'bg-[#EEF2FF] text-[#2832A4] border-[#D4DEFE]'
                  : 'bg-[#FFFBEB] text-[#D97706] border-[#FCD34D]'
              )}
            >
              {isComplainantAssociated ? 'Association Member' : 'Outside Non-Member'}
            </span>
          </div>

          {/* Profile Header */}
          <div className="flex items-center gap-4">
            <Avatar
              name={complainant.name || 'Complainant'}
              src={getMediaUrl(complainant.avatar)}
              size="lg"
              className="h-14 w-14 shrink-0 shadow-xs"
            />
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-ink truncate">
                {complainant.name || 'Complainant Name'}
              </h3>
              <p className="text-sm font-medium text-slate-500 truncate">
                {complainant.business || 'Jewellery Business'}
              </p>
              {isComplainantAssociated ? (
                <p className="text-xs font-semibold text-[#2832A4] mt-0.5">
                  ID: {complainantMembershipId || 'Association Member'}
                </p>
              ) : (
                <p className="text-xs font-semibold text-amber-700 mt-0.5">
                  Status: Outside Non-Member
                </p>
              )}
            </div>
          </div>

          {/* Info Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-medium">Phone Number:</span>
              <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>{complainant.mobile || '-'}</span>
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-medium">Email Address:</span>
              <p className="font-semibold text-slate-800 truncate flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{complainant.email || '-'}</span>
              </p>
            </div>

            <div className="sm:col-span-2 space-y-1 pt-2 border-t border-slate-100">
              <span className="text-slate-400 font-medium">Registered Address:</span>
              <p className="font-semibold text-slate-800 leading-relaxed flex items-start gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>{complainantAddress}</span>
              </p>
            </div>
          </div>
        </div>

        {/* CARD 2: COMPLAINT AGAINST (TARGET) */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-7 shadow-card space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-rose-600">
              COMPLAINT AGAINST (TARGET)
            </span>
            <span
              className={cn(
                'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border',
                isTargetAssociated
                  ? 'bg-[#F0FDF4] text-[#16A34A] border-[#86EFAC]'
                  : 'bg-[#FFFBEB] text-[#D97706] border-[#FCD34D]'
              )}
            >
              {isTargetAssociated ? 'Association Member' : 'Outside Non-Member'}
            </span>
          </div>

          {/* Target Profile Header */}
          <div className="flex items-center gap-4">
            {target.avatar ? (
              <Avatar
                name={target.name || 'Target'}
                src={getMediaUrl(target.avatar)}
                size="lg"
                className="h-14 w-14 shrink-0 shadow-xs"
              />
            ) : isTargetAssociated ? (
              <Avatar
                name={target.name || 'Member'}
                size="lg"
                className="h-14 w-14 shrink-0 shadow-xs"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#FFFBEB] text-[#D97706] font-bold text-lg border border-[#FDE68A]">
                <ShieldAlert className="h-7 w-7 text-[#D97706]" />
              </div>
            )}

            <div className="min-w-0">
              <h3 className="text-lg font-bold text-ink truncate">
                {target.name || 'Target Name'}
              </h3>
              <p className="text-sm font-medium text-slate-500 truncate">
                {target.business || target.company || 'External Organization / Non-Member'}
              </p>
              <p
                className={cn(
                  'text-xs font-semibold mt-0.5',
                  isTargetAssociated ? 'text-emerald-700' : 'text-amber-700'
                )}
              >
                {isTargetAssociated
                  ? targetMembershipId
                    ? `ID: ${targetMembershipId}`
                    : 'Position: Association Member'
                  : 'Status: Outside Non-Member'}
              </p>
            </div>
          </div>

          {/* Info Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 font-medium">Phone Number:</span>
              <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>{target.mobile || '-'}</span>
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 font-medium">Email Address:</span>
              <p className="font-semibold text-slate-800 truncate flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{target.email || '-'}</span>
              </p>
            </div>

            <div className="space-y-1 pt-2 border-t border-slate-100">
              <span className="text-slate-400 font-medium">
                {isTargetAssociated ? 'Membership / GST No:' : 'GST / ID Number:'}
              </span>
              <p className="font-semibold text-slate-800 truncate">
                {isTargetAssociated
                  ? targetMembershipId || target.gstNumber || 'Verified Member'
                  : target.gstNumber || 'Outside Non-Member (Unverified)'}
              </p>
            </div>

            <div className="space-y-1 pt-2 border-t border-slate-100">
              <span className="text-slate-400 font-medium">Address / Location:</span>
              <p className="font-semibold text-slate-800 leading-relaxed truncate">
                {targetAddress}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3 METRIC / SUMMARY CARDS matching Image 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: FINANCIAL AMOUNT INVOLVED */}
        <div className="flex items-center gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 md:p-6 shadow-card">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#2832A4] text-white shadow-md shadow-[#2832A4]/20">
            <span className="text-xl font-bold">₹</span>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              FINANCIAL AMOUNT INVOLVED
            </p>
            <p className="text-xl md:text-2xl font-black text-ink mt-0.5">
              {formatCurrency(complaint.complaintDetails?.amountInvolved)}
            </p>
          </div>
        </div>

        {/* Card 2: INCIDENT OCCURRENCE */}
        <div className="flex items-center gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 md:p-6 shadow-card">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#2832A4]">
            <Calendar className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              INCIDENT OCCURRENCE
            </p>
            <p className="text-sm font-bold text-ink mt-0.5 truncate">
              {complaint.complaintDetails?.incidentDate || 'Date not recorded'}
              {complaint.complaintDetails?.incidentTime &&
                ` at ${complaint.complaintDetails.incidentTime}`}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {complaint.complaintDetails?.location || 'Ahmedabad, Gujarat'}
            </p>
          </div>
        </div>

        {/* Card 3: COMPLAINT TYPE */}
        <div className="flex items-center gap-4 rounded-3xl border border-slate-200/80 bg-white p-5 md:p-6 shadow-card">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFFBEB] text-[#D97706]">
            <FileText className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              COMPLAINT TYPE
            </p>
            <p className="text-base font-bold text-ink mt-0.5 truncate">
              {complaint.complaintType || 'General Dispute'}
            </p>
          </div>
        </div>
      </div>

      {/* DETAILED INFORMATION & RESOLUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Issue Statement & Evidence */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Statement & Description */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-card space-y-4">
            <h4 className="text-base font-bold text-ink flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#2832A4]" />
              <span>Issue Description & Statements</span>
            </h4>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Issue Summary
                </p>
                <p className="mt-1 font-semibold text-ink text-base">
                  {complaint.description?.issueSummary ||
                    'No summary statement provided.'}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Detailed Statement
                </p>
                <p className="mt-1 text-slate-600 leading-relaxed whitespace-pre-line">
                  {complaint.description?.detailedDescription ||
                    'No detailed description provided.'}
                </p>
              </div>

              {complaint.preferredResolution && (
                <div className="rounded-2xl bg-[#EEF2FF]/60 p-4 border border-[#D4DEFE]">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#2832A4]">
                    Preferred Resolution Requested by Complainant
                  </p>
                  <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 leading-relaxed">
                    "{complaint.preferredResolution}"
                  </p>
                </div>
              )}

              {/* Has previous interaction check */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Previous interaction with target party:</span>
                <span className="font-semibold text-ink">
                  {complaint.hasPreviousInteraction ? 'Yes (History on file)' : 'No prior interaction'}
                </span>
              </div>
            </div>
          </div>

          {/* Evidence & Media Attachments */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-card space-y-4">
            <h4 className="text-base font-bold text-ink flex items-center gap-2">
              <Paperclip className="h-5 w-5 text-[#2832A4]" />
              <span>Evidence & Attachments ({complaint.media?.length || 0})</span>
            </h4>

            {complaint.media && complaint.media.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {complaint.media.map((item, idx) => {
                  const mediaUrl = getMediaUrl(item.url);
                  const isDoc =
                    item.type === 'Document' ||
                    item.url?.toLowerCase().endsWith('.pdf') ||
                    item.url?.toLowerCase().endsWith('.doc') ||
                    item.url?.toLowerCase().endsWith('.docx');
                  const isVideo =
                    item.type === 'Video' ||
                    item.url?.toLowerCase().endsWith('.mp4') ||
                    item.url?.toLowerCase().endsWith('.mov');

                  return (
                    <a
                      key={idx}
                      href={mediaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 hover:border-[#2832A4] bg-slate-50/50 hover:bg-[#EEF2FF]/40 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-xs text-[#2832A4]">
                          {isDoc ? (
                            <FileSpreadsheet className="h-5 w-5" />
                          ) : isVideo ? (
                            <Film className="h-5 w-5" />
                          ) : (
                            <ImageIcon className="h-5 w-5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-ink truncate group-hover:text-[#2832A4]">
                            {item.type || 'Attachment'} #{idx + 1}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {item.url?.split('/').pop() || 'View file'}
                          </p>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-[#2832A4] shrink-0 ml-2" />
                    </a>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No attachments submitted for this complaint.</p>
            )}
          </div>
        </div>

        {/* Right 1 Col: Administrative Action & Status Control */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-card space-y-5">
            <h4 className="text-base font-bold text-ink flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span>Administrative Action</span>
            </h4>

            {updateSuccess && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-700 flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0" />
                <span>{updateSuccess}</span>
              </div>
            )}

            {updateError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-600 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{updateError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              {/* Status Select */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Update Status
                </label>
                <select
                  value={currentStatus}
                  onChange={(e) => setCurrentStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 shadow-xs focus:border-[#2832A4] focus:outline-none focus:ring-2 focus:ring-[#2832A4]/20"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              {/* Resolution Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Resolution Notes
                </label>
                <textarea
                  rows={4}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Enter administrative action or resolution notes here..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 shadow-xs focus:border-[#2832A4] focus:outline-none focus:ring-2 focus:ring-[#2832A4]/20 resize-none leading-relaxed"
                />
              </div>

              {(complaint.adminAction?.updatedAt || complaint.updatedAt) && (
                <p className="text-[11px] text-slate-400 font-medium">
                  Last updated by{' '}
                  <span className="font-semibold text-slate-600">
                    {complaint.adminAction?.updatedBy || complaint.updatedBy || 'Admin'}
                  </span>{' '}
                  on {complaint.adminAction?.updatedAt || complaint.updatedAt}
                </p>
              )}

              <Button
                type="submit"
                variant="primary"
                disabled={isUpdating}
                loading={isUpdating}
                className="w-full rounded-full py-2.5 text-sm font-semibold shadow-md shadow-[#2832A4]/20"
              >
                Save Action
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
