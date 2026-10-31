'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  UserPlus,
  Users,
  AlertCircle,
  CheckCircle2,
  X,
  Phone,
  Building,
} from 'lucide-react';
import Avatar from '@/components/common/Avatar';
import Button from '@/components/common/Button';
import Loader from '@/components/common/Loader';
import EmptyState from '@/components/common/EmptyState';
import AddPositionModal from '@/components/committee/AddPositionModal';
import AssignMemberModal from '@/components/committee/AssignMemberModal';
import DeletePositionModal from '@/components/committee/DeletePositionModal';
import {
  getCommittees,
  getAllMembers,
  createPosition,
  deletePosition,
  addMemberToPosition,
  removeMemberFromPosition,
  getMediaUrl,
} from '@/services/committee.service';
import { cn } from '@/lib/utils';

export default function CommitteePage() {
  const [committees, setCommittees] = useState([]);
  const [membersList, setMembersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMembers, setIsFetchingMembers] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Expand / collapse state for positions (set of position IDs)
  const [expandedIds, setExpandedIds] = useState(new Set());

  // Modal States
  const [isAddPositionOpen, setIsAddPositionOpen] = useState(false);
  const [assigningPosition, setAssigningPosition] = useState(null);
  const [deletingPosition, setDeletingPosition] = useState(null);
  const [removingMemberData, setRemovingMemberData] = useState(null);

  // Feedback Toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Load committee positions from backend API
  const loadCommittees = useCallback(async (query = '') => {
    try {
      const res = await getCommittees({ search: query });
      const list = res.committees || [];
      setCommittees(list);

      // Auto-expand first 2 positions if none expanded
      setExpandedIds((prev) => {
        if (prev.size === 0 && list.length > 0) {
          return new Set(list.slice(0, 2).map((item) => item.id));
        }
        return prev;
      });
    } catch (err) {
      console.error('Failed to load committee positions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load member directory for assignment popup and card enrichment
  const loadMembers = useCallback(async () => {
    setIsFetchingMembers(true);
    try {
      const list = await getAllMembers();
      setMembersList(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Failed to load members:', err);
    } finally {
      setIsFetchingMembers(false);
    }
  }, []);

  useEffect(() => {
    loadCommittees(debouncedSearch);
  }, [loadCommittees, debouncedSearch]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  // Build a lookup map of members for instant details enrichment (avatar, business, mobile)
  const membersMap = useMemo(() => {
    const map = new Map();
    membersList.forEach((m) => {
      if (m.id !== undefined) map.set(Number(m.id), m);
      if (m.memberId !== undefined) map.set(Number(m.memberId), m);
    });
    return map;
  }, [membersList]);

  // Toggle accordion expand / collapse
  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Handle Create Position (Image 2)
  const handleCreatePosition = async (positionName) => {
    const created = await createPosition(positionName);
    showToast(`Position "${positionName}" created successfully!`);
    await loadCommittees(debouncedSearch);
    if (created?.id) {
      setExpandedIds((prev) => new Set([...prev, created.id]));
    }
  };

  // Handle Delete Position
  const handleDeletePositionConfirm = async () => {
    if (!deletingPosition) return;
    await deletePosition(deletingPosition.id);
    showToast(`Position "${deletingPosition.position}" deleted successfully.`);
    setDeletingPosition(null);
    await loadCommittees(debouncedSearch);
  };

  // Handle Assign Member to Position (Image 3)
  const handleAssignMember = async (positionId, memberId) => {
    const targetPos = committees.find((c) => c.id === positionId);
    const existing = targetPos?.members || [];
    await addMemberToPosition(positionId, existing, memberId);
    showToast('Member assigned to position successfully!');
    await loadCommittees(debouncedSearch);
    setExpandedIds((prev) => new Set([...prev, positionId]));
  };

  // Handle Remove Member from Position
  const handleRemoveMemberConfirm = async () => {
    if (!removingMemberData) return;
    const { positionId, memberId } = removingMemberData;
    const targetPos = committees.find((c) => c.id === positionId);
    const existing = targetPos?.members || [];
    await removeMemberFromPosition(positionId, existing, memberId);
    showToast('Member removed from position successfully.');
    setRemovingMemberData(null);
    await loadCommittees(debouncedSearch);
  };

  // Client-side search fallback
  const filteredCommittees = useMemo(() => {
    if (!debouncedSearch.trim()) return committees;
    const q = debouncedSearch.toLowerCase().trim();
    return committees.filter((item) => {
      const posMatches = item.position?.toLowerCase().includes(q);
      const memberMatches = item.members?.some((m) => {
        const enriched = membersMap.get(Number(m.memberId || m.id));
        return (
          m.name?.toLowerCase().includes(q) ||
          enriched?.name?.toLowerCase().includes(q) ||
          enriched?.business?.toLowerCase().includes(q) ||
          enriched?.mobile?.toLowerCase().includes(q)
        );
      });
      return posMatches || memberMatches;
    });
  }, [committees, debouncedSearch, membersMap]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl bg-[#1B1F3B] text-white px-5 py-3.5 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Committee Card matching Image 1 */}
      <section className="rounded-3xl border border-white bg-white p-6 md:p-8 shadow-card space-y-6">
        {/* Top Header Row matching Image 1 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-ink tracking-tight">
              Committee
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Manage committee positions, roles, and assign association members.
            </p>
          </div>

          {/* + Add Position Button matching Image 1 */}
          <Button
            type="button"
            variant="primary"
            onClick={() => setIsAddPositionOpen(true)}
            className="inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold shadow-md shadow-[#2832A4]/20"
          >
            <Plus className="h-4 w-4" />
            <span>Add Position</span>
          </Button>
        </div>

        {/* Search Bar matching Image 1 */}
        <div className="relative max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by position, member name, business..."
            className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-sm text-ink placeholder:text-slate-400 shadow-xs focus:border-[#2832A4] focus:outline-none focus:ring-4 focus:ring-[#2832A4]/10 transition"
          />
        </div>

        {/* POSITIONS LIST (Accordion Cards matching Image 1) */}
        {isLoading && committees.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader label="Loading committee positions..." />
          </div>
        ) : filteredCommittees.length === 0 ? (
          <div className="py-12">
            <EmptyState
              title="No positions found"
              description="No committee positions match your search criteria. Click '+ Add Position' to create one."
            />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredCommittees.map((pos) => {
              const isExpanded = expandedIds.has(pos.id);
              const members = pos.members || [];
              const memberCount = pos.totalMembers ?? members.length;

              return (
                <div
                  key={pos.id}
                  className="rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-xs transition-all hover:border-[#2832A4]/30"
                >
                  {/* Position Header Row matching Image 1 */}
                  <div
                    onClick={() => toggleExpand(pos.id)}
                    className={cn(
                      'flex items-center justify-between p-4 sm:p-5 cursor-pointer transition select-none',
                      isExpanded ? 'bg-[#F4F7FF]/80' : 'bg-white hover:bg-slate-50/70'
                    )}
                  >
                    {/* Left: Position Title & Assigned Count Badge */}
                    <div className="flex items-center gap-3 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-ink truncate">
                        {pos.position}
                      </h3>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#EEF2FF] text-[#2832A4] border border-[#D4DEFE] whitespace-nowrap">
                        {memberCount} {memberCount === 1 ? 'Member' : 'Members'} Assigned
                      </span>
                    </div>

                    {/* Right: + Add Member, Delete Position, and Chevron Toggle */}
                    <div
                      className="flex items-center gap-2 sm:gap-3 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* + Add Member Button matching Image 1 */}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setAssigningPosition(pos)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#2832A4] bg-white px-3 sm:px-4 py-1.5 text-xs font-semibold text-[#2832A4] hover:bg-blue-50 transition shadow-xs focus:outline-none focus:ring-2 focus:ring-[#2832A4]/20"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Member</span>
                      </Button>

                      {/* Delete Position Trash Button matching Image 1 */}
                      <button
                        type="button"
                        onClick={() => setDeletingPosition(pos)}
                        title="Delete Position"
                        aria-label="Delete Position"
                        className="flex h-8 w-8 items-center justify-center rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>

                      {/* Chevron Expand/Collapse Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(pos.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200/60 hover:text-slate-600 transition"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-[#2832A4]" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Position Expanded Content (Members Cards matching Image 1) */}
                  {isExpanded && (
                    <div className="p-4 sm:p-6 bg-white border-t border-slate-100 animate-in fade-in duration-150">
                      {members.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center">
                          <p className="text-xs text-slate-400">
                            No members assigned to this position yet.
                          </p>
                          <button
                            type="button"
                            onClick={() => setAssigningPosition(pos)}
                            className="mt-2 text-xs font-semibold text-[#2832A4] hover:underline inline-flex items-center gap-1"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Click here to assign a member</span>
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {members.map((memberItem) => {
                            const rawId = memberItem.memberId || memberItem.id;
                            const enriched = membersMap.get(Number(rawId)) || {};
                            const memberName = memberItem.name || enriched.name || 'Association Member';
                            const businessName = enriched.business || enriched.businessName || 'Jewellery Business';
                            const mobile = enriched.mobile || enriched.phone || '';
                            const avatarUrl = getMediaUrl(enriched.avatar || enriched.image);

                            return (
                              <div
                                key={rawId}
                                className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:border-[#2832A4]/40 hover:shadow-sm transition group"
                              >
                                {/* Member Info matching Image 1 */}
                                <div className="flex items-center gap-3.5 min-w-0">
                                  <Avatar
                                    name={memberName}
                                    src={avatarUrl}
                                    size="md"
                                    className="h-11 w-11 shrink-0 shadow-xs"
                                  />
                                  <div className="min-w-0">
                                    <h4 className="text-sm font-bold text-ink truncate">
                                      {memberName}
                                    </h4>
                                    <p className="text-xs text-slate-500 truncate mt-0.5">
                                      {businessName}
                                    </p>
                                    {mobile && (
                                      <p className="text-xs font-medium text-[#2832A4] truncate mt-0.5">
                                        {mobile}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* Remove Member Trash Button matching Image 1 */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    setRemovingMemberData({
                                      positionId: pos.id,
                                      positionName: pos.position,
                                      memberId: rawId,
                                      memberName,
                                    })
                                  }
                                  title="Remove member from position"
                                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition shrink-0 ml-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Add New Position Modal matching Image 2 */}
      <AddPositionModal
        open={isAddPositionOpen}
        onClose={() => setIsAddPositionOpen(false)}
        onCreated={handleCreatePosition}
      />

      {/* Assign Member to Position Modal matching Image 3 */}
      <AssignMemberModal
        open={Boolean(assigningPosition)}
        position={assigningPosition}
        membersList={membersList}
        isLoadingMembers={isFetchingMembers}
        onClose={() => setAssigningPosition(null)}
        onAssign={handleAssignMember}
      />

      {/* Delete Position Confirmation Modal */}
      <DeletePositionModal
        open={Boolean(deletingPosition)}
        title="Delete Position"
        description={
          deletingPosition
            ? `Are you sure you want to delete the "${deletingPosition.position}" position? All member assignments under this position will be cleared.`
            : ''
        }
        confirmLabel="Delete"
        onClose={() => setDeletingPosition(null)}
        onConfirm={handleDeletePositionConfirm}
      />

      {/* Remove Member Confirmation Modal matching Image 4 */}
      <DeletePositionModal
        open={Boolean(removingMemberData)}
        title="Remove Member"
        description={
          removingMemberData
            ? `Are you sure you want to remove "${removingMemberData.memberName}" from the ${removingMemberData.positionName} position?`
            : ''
        }
        confirmLabel="Delete"
        onClose={() => setRemovingMemberData(null)}
        onConfirm={handleRemoveMemberConfirm}
      />
    </div>
  );
}
