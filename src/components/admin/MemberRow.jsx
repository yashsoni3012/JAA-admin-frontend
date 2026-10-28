import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import { Phone, Mail, Building2, Eye, Check, X } from 'lucide-react';

// One member card row, laid out like the Members Approval reference.
// Pending members get View / Approve / Reject icon actions; others get View Details icon.
export default function MemberRow({ member, onView, onApprove, onReject }) {
  const isPending = member.status === 'Pending';

  return (
    <li className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center border-b border-slate-100 px-6 py-4 last:border-b-0 hover:bg-slate-50/50 transition-colors">
      {/* 1. Member Column */}
      <div className="md:col-span-4 flex items-center gap-4 min-w-0">
        <Avatar name={member.name} src={member.avatar} size="lg" className="shrink-0 shadow-sm" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink truncate">{member.name}</p>
          <p className="mt-0.5 text-sm text-slate-500 truncate">{member.business}</p>
        </div>
      </div>

      {/* 2. Contact Info Column */}
      <div className="md:col-span-4 min-w-0">
        <ul className="space-y-1.5 text-xs text-slate-500">
          <li className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
            <span className="truncate">{member.mobile}</span>
          </li>
          <li className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
            <span className="truncate">{member.email}</span>
          </li>
          <li className="flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" aria-hidden="true" />
            <span className="truncate">{member.country}</span>
          </li>
        </ul>
      </div>

      {/* 3. Status Column (Separate Dedicated Column) */}
      <div className="md:col-span-2 flex items-center">
        <Badge status={member.status} />
      </div>

      {/* 4. Actions Column */}
      <div className="md:col-span-2 flex items-center justify-start md:justify-end gap-2">
        {/* View Details Icon Button */}
        <button
          type="button"
          onClick={() => onView(member)}
          title="View Details"
          aria-label="View Details"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2832A4] bg-white text-[#2832A4] transition-all hover:bg-blue-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
        >
          <Eye className="h-4 w-4" />
        </button>

        {isPending && (
          <>
            {/* Approve / Accept Icon Button */}
            <button
              type="button"
              onClick={() => onApprove(member)}
              title="Approve Member"
              aria-label="Approve Member"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-emerald-400 bg-white text-emerald-600 transition-all hover:bg-emerald-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-100"
            >
              <Check className="h-4 w-4 stroke-[2.5]" />
            </button>

            {/* Reject Icon Button */}
            <button
              type="button"
              onClick={() => onReject(member)}
              title="Reject Member"
              aria-label="Reject Member"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-red-400 bg-white text-red-500 transition-all hover:bg-red-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-red-100"
            >
              <X className="h-4 w-4 stroke-[2.5]" />
            </button>
          </>
        )}
      </div>
    </li>
  );
}
