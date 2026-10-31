'use client';

import { useState, useMemo } from 'react';
import { X, Search, Check, Loader2, UserPlus, Phone, Building2 } from 'lucide-react';
import Avatar from '@/components/common/Avatar';
import Button from '@/components/common/Button';
import { getMediaUrl } from '@/services/committee.service';
import { cn } from '@/lib/utils';

export default function AssignMemberModal({
  open,
  position,
  membersList = [],
  isLoadingMembers = false,
  onClose,
  onAssign,
}) {
  const [search, setSearch] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Already assigned member IDs for this position
  const assignedIds = useMemo(() => {
    if (!position?.members) return new Set();
    return new Set(position.members.map((m) => Number(m.memberId || m.id)));
  }, [position]);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    if (!search.trim()) return membersList;
    const q = search.toLowerCase().trim();
    return membersList.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.business?.toLowerCase().includes(q) ||
        m.mobile?.toLowerCase().includes(q) ||
        m.membershipId?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q)
    );
  }, [membersList, search]);

  if (!open || !position) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMemberId) {
      setError('Please select a member to assign');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      if (onAssign) {
        await onAssign(position.id, selectedMemberId);
      }
      setSelectedMemberId(null);
      setSearch('');
      onClose();
    } catch (err) {
      console.error('Failed to assign member:', err);
      setError(err.message || 'Failed to assign member to position');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-3xl border border-white bg-white p-6 md:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-bold text-ink tracking-tight flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-[#2832A4]" />
              <span>Assign Member to {position.position}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select a registered association member to assign to this position
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        {/* Search Input */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search member by name, business, phone, ID..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs sm:text-sm text-ink placeholder:text-slate-400 shadow-xs focus:border-[#2832A4] focus:outline-none focus:ring-4 focus:ring-[#2832A4]/10 transition"
          />
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pr-1 min-h-[220px] max-h-[360px]">
          {isLoadingMembers ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-[#2832A4]" />
              <p className="text-xs">Loading association members...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No members found matching your search.
            </div>
          ) : (
            filteredMembers.map((member) => {
              const memberId = Number(member.id);
              const isAlreadyAssigned = assignedIds.has(memberId);
              const isSelected = selectedMemberId === memberId;
              const avatarUrl = getMediaUrl(member.avatar);

              return (
                <div
                  key={memberId}
                  onClick={() => {
                    if (!isAlreadyAssigned) {
                      setSelectedMemberId(isSelected ? null : memberId);
                      if (error) setError('');
                    }
                  }}
                  className={cn(
                    'flex items-center justify-between p-3.5 rounded-2xl border transition cursor-pointer select-none',
                    isAlreadyAssigned
                      ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                      : isSelected
                      ? 'border-[#2832A4] bg-[#EEF2FF]/60 shadow-xs ring-1 ring-[#2832A4]'
                      : 'border-slate-200 hover:border-[#2832A4]/50 hover:bg-slate-50/70'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      name={member.name}
                      src={avatarUrl}
                      size="md"
                      className="h-10 w-10 shrink-0 shadow-xs"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-ink truncate">
                        {member.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                        <span>{member.business || 'Jewellery Business'}</span>
                        {member.membershipId && (
                          <span className="text-[11px] font-semibold text-[#2832A4]">
                            • {member.membershipId}
                          </span>
                        )}
                      </p>
                      {member.mobile && (
                        <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3" />
                          <span>{member.mobile}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 ml-3">
                    {isAlreadyAssigned ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-200/70 text-slate-500">
                        Assigned
                      </span>
                    ) : (
                      <div
                        className={cn(
                          'flex h-6 w-6 items-center justify-center rounded-full border transition',
                          isSelected
                            ? 'border-[#2832A4] bg-[#2832A4] text-white'
                            : 'border-slate-300 bg-white hover:border-[#2832A4]'
                        )}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            {selectedMemberId ? '1 member selected' : 'No member selected'}
          </p>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-full border border-slate-300 bg-white px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedMemberId}
              loading={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-2 text-xs font-semibold shadow-md shadow-[#2832A4]/20"
            >
              <span>Assign Member</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

